# Phase 4 — CI/CD Guide

This is a **standalone, type-it-yourself guide** to build the two GitHub Actions
pipelines for the Wijha project. You write every line (it's graded DevOps).
Read the **Context** first so the choices make sense, then do the steps in order.

> **Note on Jenkins**: the team may later move CI to Jenkins. This guide uses
> **GitHub Actions** because the repo + secrets are already wired for it and
> nothing extra needs hosting. A "If you switch to Jenkins later" section at the
> bottom maps each piece to its Jenkins equivalent.

---

## Context — what already exists (don't rebuild these)

- **App**: 6 microservices. Dirs: `services/gateway`, `services/flight-service`,
  `services/hotel-service`, `services/weather-service`, `services/currency-service`,
  and `frontend/`. Each has its own `Dockerfile`.
- **Infra**: 3 EC2 boxes (k3s cluster) already provisioned by Terraform and
  configured by Ansible. ArgoCD + monitoring running.
- **Kubernetes manifests**: `Kubernetes/{gateway,flight,hotel,weather,currency,frontend}/k3s.yaml`
  — each pins an image `amirazzamm/wijha-<svc>:v1.0.0`. **CI's job is to replace
  that `:v1.0.0` tag with the real build tag.**
- **ArgoCD**: watches the repo path `Kubernetes/` on branch `main`, auto-syncs.
  So CI does **not** talk to the cluster — it just pushes images and commits a
  new tag. ArgoCD notices the commit and deploys. (This is the "GitOps pull model".)
- **GitHub repo**: `nhahub/NHA-4-269`.
- **ALL secrets already set** (Settings → Secrets and variables → Actions) — nothing
  to add, both pipelines are ready credential-wise:
  - `DOCKERUSERNAME` = `amirazzamm`
  - `DOCKERPASSWORD` = Docker Hub **access token** (not the account password)
  - `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` = IAM key (EC2 + S3 + DynamoDB)
  - `SSH_PRIVATE_KEY` = contents of `~/.ssh/id_ed25519` (private key, full BEGIN/END block)
  - > ⚠️ **The original AWS key was leaked in a screenshot and must be rotated.** If
    > that hasn't happened yet, rotate in IAM and update the two AWS secrets before
    > running `infra.yaml apply`. Confirm with Amir.

## What you are building

1. **`deploy.yaml`** — app pipeline. On code push: build + push 6 Docker images,
   then bump the image tag in the manifests and commit. ArgoCD takes it from there.
2. **`infra.yaml`** — infra pipeline. Manual trigger only. Runs Terraform
   (plan/apply/destroy) and optionally Ansible, to manage the EC2 + k3s setup.

## The GitOps flow (memorize this for your defense)

```
 git push (app code)
   → deploy.yaml: docker build + push  ──►  Docker Hub  (tag = git SHA)
   → deploy.yaml: sed new tag into Kubernetes/*/k3s.yaml + git commit main
        │
        ▼
 ArgoCD (running in cluster) watches Kubernetes/  ──►  detects new tag
   → syncs ──► kubelet pulls new image ──► pods roll
```

Key rule: **the image tag must change every deploy**, or ArgoCD sees no diff and
nothing happens. We use the **git commit SHA** as the tag — unique per push, no
manual version bumping.

---

# Step 1 — Write `deploy.yaml`

Create `.github/workflows/deploy.yaml`. Type this exactly:

```yaml
name: deploy

on:
  push:
    branches: [main]
    paths:                      # only app code triggers; manifest bumps won't re-trigger
      - 'services/**'
      - 'frontend/**'
      - '.github/workflows/deploy.yaml'

permissions:
  contents: write               # needed to commit the tag bump back to main

env:
  REGISTRY_USER: amirazzamm

jobs:
  build-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - { dir: services/gateway,          image: wijha-gateway }
          - { dir: services/flight-service,   image: wijha-flight }
          - { dir: services/hotel-service,    image: wijha-hotel }
          - { dir: services/weather-service,  image: wijha-weather }
          - { dir: services/currency-service, image: wijha-currency }
          - { dir: frontend,                  image: wijha-frontend }
    steps:
      - uses: actions/checkout@v4

      - name: Docker login
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERUSERNAME }}
          password: ${{ secrets.DOCKERPASSWORD }}

      - name: Build + push
        uses: docker/build-push-action@v6
        with:
          context: ${{ matrix.dir }}
          push: true
          tags: ${{ env.REGISTRY_USER }}/${{ matrix.image }}:${{ github.sha }}

  bump-tags:
    needs: build-push           # only after all 6 images pushed
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # One marketplace action updates the image tag in all 6 manifests.
      # propertyPath points at the Deployment's container image (first doc in each file).
      - name: Bump image tags
        uses: fjogeleit/yaml-update-action@main
        with:
          commitChange: false        # we commit in the next step, all 6 at once
          changes: |
            {
              "Kubernetes/gateway/k3s.yaml":  { "spec.template.spec.containers[0].image": "amirazzamm/wijha-gateway:${{ github.sha }}" },
              "Kubernetes/flight/k3s.yaml":   { "spec.template.spec.containers[0].image": "amirazzamm/wijha-flight:${{ github.sha }}" },
              "Kubernetes/hotel/k3s.yaml":    { "spec.template.spec.containers[0].image": "amirazzamm/wijha-hotel:${{ github.sha }}" },
              "Kubernetes/weather/k3s.yaml":  { "spec.template.spec.containers[0].image": "amirazzamm/wijha-weather:${{ github.sha }}" },
              "Kubernetes/currency/k3s.yaml": { "spec.template.spec.containers[0].image": "amirazzamm/wijha-currency:${{ github.sha }}" },
              "Kubernetes/frontend/k3s.yaml": { "spec.template.spec.containers[0].image": "amirazzamm/wijha-frontend:${{ github.sha }}" }
            }

      # Marketplace action handles git config + commit + push.
      - name: Commit the bump
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "ci: bump image tags to ${{ github.sha }} [skip ci]"
          file_pattern: "Kubernetes/*/k3s.yaml"
```

### Why each part matters

- **All steps are marketplace actions** (no hand-rolled shell): `docker/login-action`,
  `docker/build-push-action` for images; `fjogeleit/yaml-update-action` to set the
  image tag; `stefanzweifel/git-auto-commit-action` to commit+push. Pinned by major
  version so they don't drift.
- **`paths:` filter** — the pipeline triggers only on `services/**` / `frontend/**`.
  The `bump-tags` job commits changes to `Kubernetes/**`, which is **not** in the
  list, so that commit will **not** re-trigger the workflow. Plus `[skip ci]` in the
  commit message. Two guards against an infinite build loop — keep both.
- **matrix** — builds all 6 services in parallel. Note the name mapping:
  the dir `flight-service` maps to image `wijha-flight` (the `-service` suffix is
  dropped). `frontend` lives at repo root, not under `services/`.
- **`permissions: contents: write`** — without this the auto `GITHUB_TOKEN` can't
  push the bump commit.
- **`needs: build-push`** — never bump tags until every image actually exists on
  Docker Hub, else ArgoCD would try to pull a missing image.
- **tag = `github.sha`** — the unique-per-push rule. (If you'd rather have pretty
  `v1.2.3` tags, you'd add a manual version input — but then someone must bump it
  every release. SHA is zero-maintenance.)

### Gotcha checklist

- [ ] Each service dir has a working `Dockerfile` (they do — don't add new ones).
- [ ] `frontend` builds a multi-stage image (node build → nginx). Context is
      `./frontend`, which is correct in the matrix.
- [ ] **Multi-doc caveat**: each `k3s.yaml` holds Deployment + Service (+ HPA) in
      one file. `yaml-update-action` targets the `image` key in the **Deployment
      doc** (the path resolves there). After your first real run, open one file and
      confirm the Service/HPA docs are still intact. If the action ever mangles the
      other docs, the fallback is to split each manifest into separate files
      (`deployment.yaml` / `service.yaml`) — but verify first; usually fine.

---

# Step 2 — Write `infra.yaml`

This one provisions/destroys the cloud infra. It is **manual-trigger only**
(`workflow_dispatch`) — you never want infra churning on a code push.

### 2a — Secrets (already set — just confirm)

These three are **already in the repo** (see Context). Terraform needs the AWS
creds; Ansible needs the SSH private key. Nothing to add — just confirm they exist
under Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM access key (a user with EC2 + S3 + DynamoDB perms) |
| `AWS_SECRET_ACCESS_KEY` | matching secret key |
| `SSH_PRIVATE_KEY` | contents of `~/.ssh/id_ed25519` (the **private** key, full file) |

> ⚠️ Never paste these into the YAML. Only reference them as `${{ secrets.X }}`.
> The Terraform **state** lives in S3 + DynamoDB already (configured in
> `infra/terraform/versions.tf`) — don't change that.
> ⚠️ **Rotate the AWS key first** if it hasn't been done — the original was leaked
> in a screenshot. Confirm with Amir before running `apply`.

### 2b — Create `.github/workflows/infra.yaml`

```yaml
name: infra

on:
  workflow_dispatch:            # manual button only — no auto trigger
    inputs:
      action:
        description: "Terraform action"
        type: choice
        required: true
        default: plan
        options: [plan, apply, destroy]
      run_ansible:
        description: "Run Ansible after apply?"
        type: boolean
        required: true
        default: false

permissions:
  contents: read

jobs:
  terraform:
    runs-on: ubuntu-latest
    outputs:
      pub:  ${{ steps.apply.outputs.node_public_ips }}    # JSON map {server,app,monitoring}
      priv: ${{ steps.apply.outputs.node_private_ips }}   # JSON map {server,app,monitoring}
    steps:
      - uses: actions/checkout@v4

      # Marketplace action loads AWS creds — no exporting env by hand.
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id:     ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      # dflook actions wrap Terraform end-to-end — they run init themselves,
      # read the S3 backend automatically, and expose outputs. No `run:` shell.
      - name: Terraform plan
        if: inputs.action == 'plan'
        uses: dflook/terraform-plan@v1
        with:
          path: infra/terraform

      - name: Terraform apply
        id: apply
        if: inputs.action == 'apply'
        uses: dflook/terraform-apply@v1
        with:
          path: infra/terraform
          auto_approve: true

      - name: Terraform destroy
        if: inputs.action == 'destroy'
        uses: dflook/terraform-destroy@v1
        with:
          path: infra/terraform

  ansible:
    needs: terraform
    if: inputs.action == 'apply' && inputs.run_ansible
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Marketplace action installs the private key into the ssh-agent.
      - uses: shimataro/ssh-key-action@v2
        with:
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          name: id_ed25519
          known_hosts: unnecessary        # ansible.cfg already sets host_key_checking=False

      # Marketplace action runs the playbook (installs Ansible + passes inventory inline).
      # Public + private IPs come straight from the apply step's outputs — fromJSON
      # pulls each role out of the map, so there are no placeholders to fill.
      - uses: dawidd6/action-ansible-playbook@v2
        with:
          playbook: playbook.yml
          directory: infra/ansible
          inventory: |
            [server]
            wijha-server ansible_host=${{ fromJSON(needs.terraform.outputs.pub).server }} private_ip=${{ fromJSON(needs.terraform.outputs.priv).server }}
            [app]
            wijha-app ansible_host=${{ fromJSON(needs.terraform.outputs.pub).app }} private_ip=${{ fromJSON(needs.terraform.outputs.priv).app }}
            [monitoring]
            wijha-monitoring ansible_host=${{ fromJSON(needs.terraform.outputs.pub).monitoring }} private_ip=${{ fromJSON(needs.terraform.outputs.priv).monitoring }} node_label="--node-label role=monitoring"
            [agents:children]
            app
            monitoring
            [k3s:children]
            server
            agents
```

### Why each part matters

- **Every step is a marketplace action — zero `run:` shell.** `aws-actions/configure-aws-credentials`
  (creds), `dflook/terraform-plan|apply|destroy` (wraps the whole TF lifecycle:
  init + the action + outputs), `shimataro/ssh-key-action` (private key → agent),
  `dawidd6/action-ansible-playbook` (installs Ansible + runs the playbook).
- **`workflow_dispatch` with a `choice` input** — dropdown (plan / apply / destroy)
  in the Actions UI. No infra runs by accident.
- **dflook reads the S3 backend automatically** from `infra/terraform/versions.tf`
  — no manual `init`. `auto_approve: true` on apply because there's no human at a
  prompt in CI.
- **`steps.apply.outputs.node_public_ips` / `node_private_ips`** — dflook exposes
  each Terraform output. They're JSON maps (`{server,app,monitoring}`), so the
  Ansible job uses `fromJSON(...)` to pull each role's IP. **This replaces the old
  python parsing AND the `PUT_PRIVATE_IP` placeholder — both IPs now flow through
  automatically.**
- **`dawidd6/action-ansible-playbook` `inventory:` input** — inline inventory text,
  no file writing. Conditional: runs only on `apply` **and** when you tick `run_ansible`.

### Honest caveats (read these — the infra pipeline has rough edges)

1. **TF output names must match**: the inventory reads `node_public_ips` and
   `node_private_ips` from the apply step. Those are the exact output names in
   `infra/terraform/outputs.tf`, each a map keyed `server`/`app`/`monitoring`. If
   you rename an output, update the `fromJSON(...)` keys to match — otherwise the
   inventory comes out blank.
2. **SSH host keys**: first connect to fresh boxes will prompt host-key checks.
   The repo's `ansible.cfg` already sets `host_key_checking = False` — make sure
   that's still there, or add `ANSIBLE_HOST_KEY_CHECKING: "False"` as env.
3. **Public IPs change** on destroy+apply. That's exactly why this job rebuilds
   the inventory from fresh TF outputs instead of using the committed one.
4. **Cost**: `apply` starts billing 3× t3.small. Run **destroy** when done.

---

# Step 3 — Test it

**deploy.yaml** (safe to test):
1. Commit + push the workflow file.
2. Make a trivial change under `services/` or `frontend/` and push.
3. Watch Actions → `deploy` run. Expect: 6 images pushed to Docker Hub
   (`hub.docker.com/u/amirazzamm`), then a `ci: bump image tags...` commit on main.
4. Confirm that commit did **not** start a second run (paths guard working).

**infra.yaml** (costs money — coordinate before running apply):
1. Push the workflow.
2. Actions → `infra` → Run workflow → action = **plan** first. Read the plan.
3. Only run **apply** when the team agrees. **destroy** when finished.

---

# If you switch to Jenkins later

Same logic, different tool. Mapping:

| GitHub Actions piece | Jenkins equivalent |
|----------------------|--------------------|
| `deploy.yaml` / `infra.yaml` | a `Jenkinsfile` (declarative pipeline) per job |
| repo Secrets (`DOCKERUSERNAME` …) | Jenkins **Credentials** store (bind with `withCredentials`) |
| `on: push` trigger | GitHub **webhook** → Jenkins, or `pollSCM` |
| `workflow_dispatch` | "Build with Parameters" (choice/boolean params) |
| matrix build | `matrix {}` block or a scripted loop over services |
| auto `GITHUB_TOKEN` push | a PAT credential for `git push` the tag bump |
| runs on GitHub's runners | needs a **Jenkins host** (a box must run Jenkins) — decide where first |

The ArgoCD half does **not** change — Jenkins still just builds, pushes, and
commits the tag; ArgoCD still pulls from `main`. Only the CI engine swaps.

---

## Quick reference

- Repo: `nhahub/NHA-4-269` · branch `main`
- Docker Hub: `amirazzamm/wijha-{gateway,flight,hotel,weather,currency,frontend}`
- Image tag = git commit SHA
- ArgoCD watches `Kubernetes/` → auto-sync (don't apply manifests from CI)
- Secrets needed: `DOCKERUSERNAME`, `DOCKERPASSWORD` (have) · `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `SSH_PRIVATE_KEY` (add for infra.yaml)
