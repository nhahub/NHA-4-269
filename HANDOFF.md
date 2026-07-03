# Handoff: Wijha Travel Aggregator — Glacia App + DevOps Architecture

**Generated**: 2026-06-28 (updated)
**Branch**: main
**Status**: App built & themed; TF applied (3 EC2 live); **Ansible FULLY DONE+verified (k3s + ArgoCD + monitoring)**; **k8s manifests rewritten (Phase 3 done)**; **Phase 4 CI in progress** — `deploy.yaml`+`infra.yaml` NOT typed yet, but guide written (`PHASE4-CI-GUIDE.md`) + all GitHub secrets set. A friend is taking Phase 4 (may later move to Jenkins).

## Goal

DEPI graduation project (DevOps track). **User does ALL DevOps; the AI builds ONLY the application AND guides the user line-by-line on DevOps (user types it).** App = microservices travel aggregator, **no database** (mock data). One search returns flights + hotels + weather, priced in a chosen currency. UI = cool snowy "Glacia" aesthetic (blue glassmorphism).

## Brand

- **Name: Wijha (وِجهة, "destination")** — renamed from "Wanderly". All displayed brand text swapped (Navbar, Footer, index.html title, About/Reviews/SearchPage prose, styles.css header). Import path `data/wanderly.js` and filenames UNCHANGED (only displayed text changed).
- **Logo: plane-window SVG** in `Navbar.jsx` — white rounded-capsule porthole + ice-blue glass + sun/cloud, inside the blue gradient tile. (Was letter "W", briefly Arabic waw "و", now plane window.) Footer mark = plain blue circle (untouched).

## Completed — App

- [x] 5 Node/Express microservices: `gateway` (fan-out/aggregate), `flight`, `hotel`, `weather`, `currency`. Each `/health`, `/metrics` (prom-client). Redis optional cache (graceful-off).
- [x] React 18 + Vite + Router v6 frontend, 12 pages. Context store (`store.jsx`) global currency + toast.
- [x] Glacia theme (blue `#2F6BE6`, Poppins+Inter, `.wl-glass`), snowy hero, SnowCarousel, 16 destinations, emojis stripped.
- [x] Brand rename Wanderly→Wijha + plane-window logo (see Brand).
- [x] Build verified: `vite build` ✓.

## Completed — DevOps

- [x] **Architecture decided** (see DevOps Architecture below). Eraser diagram generated + approved (grad-ready).
- [x] Removed empty root `Dockerfile` (microservices = 1 image per service; root monolith image is wrong).
- [x] Fixed `.gitignore`: was `.scripts/`/`.infra/` (dot-prefix bug, matched nothing + wrong intent). Now ignores TF state (`*.tfstate`, `**/.terraform/`), ansible `*.retry` + generated `inventory/hosts.ini`, `*-handoff.zip`. Keeps `.terraform.lock.hcl` TRACKED. Does NOT ignore `infra/` (it's code).
- [x] Deleted stray 104KB `# Wanderly...handoff.zip` cruft.
- [x] Scaffolded folder tree (see File Tree). Most files still empty.
- [x] **TERRAFORM DONE + VALIDATED** (guide-mode, user typed every line). See Terraform State below.

## Terraform State (infra/terraform/)

- [x] **Backend bootstrapped (one-time, manual)**: S3 bucket `wijha-tfstate-amir01` (versioned) + DynamoDB lock table `wijha-tf-lock`, both `us-east-1`. AWS account `533590176269`.
- [x] **SSH key generated**: `~/.ssh/id_ed25519` (ed25519, no passphrase). Pubkey → TF uploads as AWS key pair `wijha-key`. SSH in: `ssh -i ~/.ssh/id_ed25519 ubuntu@<ip>`.
- [x] `versions.tf` — TF ≥1.6, AWS provider ~>5 (locked v5.100.0), S3 backend. (Warning: `dynamodb_table` deprecated → `use_lockfile`; harmless, left as-is — standard taught pattern.)
- [x] `variables.tf` — `aws_region`(us-east-1), `project`(wijha), `instance_type`(t3.small), `key_name`(wijha-key), `public_key_path`(~/.ssh/id_ed25519.pub), `ssh_ingress_cidr`(0.0.0.0/0).
- [x] `main.tf` — data: Ubuntu 22.04 AMI (Canonical owner 099720109477), default VPC + subnets. resources: `aws_key_pair.key`, `aws_security_group.k3s_SG` (ingress: SSH 22, NodePort 30000-32767, intra-cluster self; egress all — NO 6443, dropped on purpose, kubectl via SSH on server), `aws_instance.k3s` for_each over `locals.nodes` {server=control-plane, app, monitoring}, t3.small, 40GB gp3, `subnet...ids[0]`.
- [x] `outputs.tf` — `node_public_ips`, `node_private_ips`, `ssh_commands` (maps keyed by role).
- [x] `terraform init` ✓ (S3 backend configured), `validate` ✓ Success, `plan` ✓ **5 to add, 0 change, 0 destroy** (key pair + SG + 3 EC2; data sources not counted).
- [x] **`terraform apply` DONE** (2026-06-28). 3 EC2 live in us-east-1 (NOT eu-north — watch console region). IPs:
  - `wijha-server` pub `3.238.250.18` / priv `172.31.65.27` (control plane)
  - `wijha-app` pub `3.236.171.218` / priv `172.31.79.238`
  - `wijha-monitoring` pub `3.238.198.185` / priv `172.31.66.80`
  - SSH verified OK. ⚠️ public IPs change on stop/start or destroy+apply — repaste into ansible inventory.
  - ⚠️ **billing live, 3× t3.small. `terraform destroy` when done.** (Stray `VariOne-Website` c7i-flex.large also in account — different project, not ours.)

## Ansible State (infra/ansible/)

- [x] `ansible.cfg` — remote_user ubuntu, key `~/.ssh/id_ed25519`, host_key_checking off, become sudo root.
- [x] `inventory/hosts.ini` — groups server/app/monitoring; `[agents:children]`=app+monitoring; `[k3s:children]`=all. Each host has `ansible_host`(public) + `private_ip`. monitoring host has `node_label="--node-label role=monitoring"`.
- [x] `group_vars/all.yml` — python3, `k3s_version: v1.30.5+k3s1`, `server_private_ip`, `node_label: ""` (default; monitoring overrides).
- [x] `playbook.yml` — 5 plays: common(k3s) → k3s_server(server) → k3s_agent(agents) → argocd(server) → monitoring(monitoring).
- [x] **common role** — apt update (retry loop for cloud-init lock), base pkgs (curl/apt-transport-https/ca-certificates), swapoff. (timezone task REMOVED — `ansible.builtin.timezone` not in builtin, boxes already UTC.)
- [x] **k3s_server role** — installs k3s server pinned version, `--node-ip`/`--advertise-address`=private, `--tls-san`=public, kubeconfig mode 644; waits node-token; slurp+set_fact `k3s_token`+`k3s_url` (agents read via hostvars); wait API ready.
- [x] **k3s_agent role** — installs k3s agent, joins via `K3S_URL`+`K3S_TOKEN` from server facts, `--node-ip`=private, `{{ node_label }}`. **VERIFIED: PLAY RECAP all green, 3 nodes joined.**
- [x] **argocd role DONE + VERIFIED** — create ns argocd → `kubectl apply --server-side=true --force-conflicts` install.yaml (server-side REQUIRED: applicationsets CRD exceeds 262144-byte annotation limit on client apply) → patch argocd-server svc NodePort 30443 → rollout wait → read `argocd-initial-admin-secret` → debug print. UI: `https://3.238.250.18:30443`, user `admin`, initial pw `bIllPu4alikpepvn` (rotate after demo).
- [x] **monitoring role WRITTEN** (run/verify pending). Play moved to `hosts: server` (helm needs kubeconfig, lives on server; pods pinned to monitoring node via nodeSelector). Tasks: install Helm (get-helm-3) → add prometheus-community repo + update → copy values to `/tmp/values-kube-prom-stack.yaml` → `helm upgrade --install kube-prom prometheus-community/kube-prometheus-stack -n monitoring --create-namespace -f ... --wait --timeout 10m`. All helm tasks set `KUBECONFIG=/etc/rancher/k3s/k3s.yaml`. Values (`roles/monitoring/files/values-kube-prom-stack.yaml`): NodePorts prom 30090 / alertmanager 30093 / grafana 30030; each `nodeSelector role=monitoring`; grafana adminPassword admin; node-exporter auto DaemonSet all nodes. Verify: `kubectl get pods -n monitoring -o wide` all Running on wijha-monitoring; Grafana `http://3.238.198.185:30030`.

**Ansible run cmd**: `cd infra/ansible && ansible-playbook playbook.yml` (roles idempotent via `creates:`). Verify: `ssh ... 'sudo k3s kubectl get nodes -o wide'`.

**Decisions baked into TF**: 3× t3.small (NOT free tier — micro OOMs monitoring; small=2GB min), default VPC + subnet[0] (same AZ, simple), TF creates key pair from local ed25519 pubkey, SSH open 0.0.0.0/0 (user choice; key-only auth + short-lived boxes), no 6443 (kubectl on server via SSH), spelled `defult` everywhere (typo but refs consistent — harmless).

## DevOps Architecture (decided)

**Target: 3× EC2, single k3s cluster, GitOps via ArgoCD.**

- **EC2-1 · k3s server**: control plane + **ArgoCD** (argocd ns, UI NodePort 30443) + node-exporter.
- **EC2-2 · k3s agent (app)**: 6 app deployments (frontend+gateway NodePort, 4 backends ClusterIP), all `replicas:2` + HPA (CPU) + podAntiAffinity. node-exporter.
- **EC2-3 · k3s agent (role=monitoring)**: Helm `kube-prometheus-stack` (Prometheus 30090, Alertmanager 30093, Grafana 30030), node-exporter DaemonSet. Pinned here via `nodeSelector role=monitoring`.

**HA**: multi-node + replicas:2 + podAntiAffinity → node dies, pods reschedule, app stays up. HPA = pod autoscale on CPU. (True node-autoscaling / cluster-autoscaler = out of scope, too heavy.)

**GitOps flow** (no appleboy, no CI→cluster):
```
deploy.yaml: build → push image (Docker Hub, tag vX.Y.Z NOT latest) → bump tag in Kubernetes/*.yaml → git commit main
ArgoCD (in cluster): watch/pull main → sync/apply → pods
```
- ArgoCD Application watches repo path `Kubernetes/`, syncPolicy automated (prune + selfHeal), CreateNamespace=true.
- CI must commit to the SAME branch Argo watches (main). Image tag must be real version, not `latest`, or Argo won't detect change.

**IaC layers:**
- **Terraform** (runs IN pipeline, `workflow_dispatch`): 3 EC2, SGs, key pair, VPC. State = S3 + DynamoDB lock (REQUIRED — else infra churns / state lost / secrets leak).
- **Ansible**: configures nodes. Roles map from old `scripts/`: `common` (docker/base), `k3s_server`, `k3s_agent`, `argocd`, `monitoring` (helm kube-prometheus-stack). Old bare-metal `prom 2.sh`/`gra 2.sh`/`ne 2.sh` RETIRE — helm replaces them (kube-prom-stack ships Prometheus+Grafana+Alertmanager+node-exporter DaemonSet).

**Monitoring / alerting:**
- kube-prometheus-stack default rules cover pod failure: `KubePodCrashLooping`, `KubePodNotReady`, `KubeDeploymentReplicasMismatch`.
- **Alertmanager → email** via Gmail SMTP (`smtp.gmail.com:587`). Needs Gmail **App Password** (16-char, 2FA on).
- ⚠️ **SMTP password = secret. NEVER commit to git** (helm values → ArgoCD → GitHub). Use k8s Secret created out-of-band (`kubectl create secret`), mount via `alertmanagerSpec.secrets`, reference `auth_password_file`. Sealed-Secrets/SOPS optional.

**Redis: DECIDED REMOVE** (optional cache, not a DB; user has no DB by design). NOT yet executed — still in `docker-compose.yml` + gateway code (graceful-off). App-side edit pending user "go".

## Completed Since (2026-06-30)

- [x] **Monitoring role DONE + VERIFIED** — all kube-prom-stack pods Running on wijha-monitoring; node-exporter DaemonSet 1/node; Grafana up (admin/admin) w/ default dashboards + Prometheus datasource. (First run hit transient GitHub 500 on chart tgz — retry cleared.)
- [x] **k8s manifests rewritten (Phase 3)** — `Kubernetes/{6 svcs}/k3s.yaml` real: Deployment(replicas:2, podAntiAffinity, nodeSelector role=app, liveness+readiness, requests+limits) + Service + HPA(v2, CPU 70%, 2-4). gateway NodePort 30080 (+upstream-URL env, no Redis), frontend NodePort 30088 port 80, 4 backends ClusterIP 8081-8084. `namespace.yaml` = real Namespace `wijha`. **Service names = compose DNS** (`flight-service` etc.) — gateway env + nginx depend on it.
- [x] **`Kubernetes/monitoring/` DELETED** (helm owns it, not Argo).
- [x] **ArgoCD Application written** — `argocd/application.yaml` at **repo ROOT** (out of watched `Kubernetes/` so Argo doesn't self-manage). repoURL `https://github.com/nhahub/NHA-4-269.git`, path `Kubernetes`, branch main, automated prune+selfHeal, CreateNamespace. **NOT yet applied to cluster.**
- [x] **GitHub repo live**: `nhahub/NHA-4-269`. **Secrets set**: `DOCKERUSERNAME`, `DOCKERPASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SSH_PRIVATE_KEY`.
- [x] **`PHASE4-CI-GUIDE.md` written** (for friend) — full `deploy.yaml` + `infra.yaml`, marketplace-actions only (no custom shell): docker/login + docker/build-push + fjogeleit/yaml-update + stefanzweifel/git-auto-commit; dflook/terraform-{plan,apply,destroy} + aws configure-creds + shimataro/ssh-key + dawidd6/ansible-playbook. **Tag strategy = git SHA** (not vX.Y.Z). Includes Jenkins-mapping table.

## Phase 4 Update — Eyad branch (2026-07-03)

Eyad **implemented** Phase 4 CI on branch `Eyad` — but **diverged from `PHASE4-CI-GUIDE.md`**. State on `Eyad`:

- **`.github/workflows/CICD-Pipeline.yml`** (102 lines) — single workflow, 2 jobs (`build` → `deploy`). Triggers: push on `Eyad` + `main`.
  - **build**: `docker/login-action@v2` + 6× `docker/build-push-action@v7`. Contexts: `services/{currency,flight,gateway,hotel,weather}-service` + `./frontend`. Tags = `${DOCKERUSERNAME}/<svc>-service:latest` (e.g. `amirazzamm/currency-service:latest`, `amirazzamm/frontend-service:latest`).
  - **deploy** (`needs: build`): `appleboy/ssh-action@v1.0.3` → SCP `./Kubernetes` to `/home/ubuntu/project/Kubernetes` on server → `kubectl apply` namespace + 6 svc manifests directly.
- **`services/gateway` → `services/gateway-service`** (git mv). Leftover untracked `services/gateway/node_modules` remains locally — harmless, not in git.
- **k8s manifests** — image lines swapped to `amirazzamm/<svc>-service:latest` (`#new image by github action`); old `wijha-*:v1.0.0` commented out.

**DECISION (2026-07-03): ArgoCD DROPPED, appleboy push is the deploy model.** GitOps pull retired in favor of Eyad's simpler CI→SSH→kubectl apply. Repo changes done:
- Deleted `argocd/application.yaml` + `infra/ansible/roles/argocd/`.
- Removed `argocd` play from `playbook.yml` (plays now: common → k3s_server → k3s_agent → monitoring).

**Still TODO for appleboy path (open):**
- **Live cluster still runs ArgoCD** — run on server: `kubectl delete ns argocd` (installed earlier, now orphaned).
- **Tag = `latest`** — `kubectl apply` of unchanged manifest won't roll pods unless `imagePullPolicy: Always` + `kubectl rollout restart`. Add rollout-restart to deploy script or switch to SHA tags, else image won't update.
- **New secrets required**: `EC2_HOST_IP`, `EC2_USERNAME` — NOT in confirmed set. Deploy job fails until added.
- **No `infra.yaml`** — Terraform still manual. Empty stubs `Pipeline.yaml` + `infra.yaml` still present (❌ every push).

## Not Yet Done

- [ ] **Phase 4: friend writes `deploy.yaml` + `infra.yaml`** from guide. Old `Pipeline.yaml` empty — delete or ignore.
- [ ] **Phase 5 go-live**: push repo → deploy.yaml builds 6 images→Docker Hub → `kubectl apply -f argocd/application.yaml` + label app node `role=app` → Argo syncs → verify app at `http://3.236.171.218:30088`.
- [ ] **⚠️ ROTATE leaked AWS key** — key `AKIAXYPDT6IG3N7AYSPZ` was shown in a screenshot (compromised). IAM → delete → new key → update both AWS secrets. Do BEFORE any infra.yaml apply.
- [ ] **Alertmanager email** — Gmail SMTP app-password as k8s Secret (NEVER in git).
- [ ] Remove Redis from compose + gateway (decided, not done).
- [ ] `git rm scripts/` (old bare-metal, superseded by ansible) — user chose to KEEP for now.
- [x] **COMMITTED + PUSHED** (2026-06-30, commit `cec11fc`) to `nhahub/NHA-4-269`. Branches on remote: **`main`** + **`Eyad`** (Eyad = friend's branch for Phase 4 CI; PRs into main). `.gitignore` now also ignores `*.tfvars` + `.claude/` (both confirmed not pushed). HANDOFF/PROGRESS pushed AS-IS (user's call) → still contains ArgoCD pw + AWS key id → **rotate both**.
- [ ] **2 empty workflow stubs FAIL on every push**: `.github/workflows/infra.yaml` + `Pipeline.yaml` are empty placeholders — GitHub auto-runs any file in workflows/, empty = ❌. User chose to KEEP them (not delete). They stay red until friend fills `infra.yaml` (from guide) + writes `deploy.yaml` (replaces dead `Pipeline.yaml`).
- [ ] Booking flow / Login / Saved / Trips = static "coming soon" (no DB by design, out of scope).
- [ ] Weather aside panel on SearchPage still warm cream gradient (`#FBF1DF` etc.) — sed missed; off-theme, unflagged, left as-is.

## Failed Approaches (Don't Repeat)

- **Root Dockerfile** to "dockerize app as a whole" → wrong for microservices (kills independent scaling/HA/orchestration). Deleted. Each service has own Dockerfile; compose/k8s = the "whole app".
- **`.gitignore` dot-prefix** `.scripts/`/`.infra/` matched nothing AND would wrongly ignore infra code. Ignore TF *state*, not infra dir.
- **Redis host port** `ports: ["6379:6379"]` → `port is already allocated`. Use `expose:` only; reach via compose hostname `redis`. (Moot once Redis removed.)
- **Tailwind**: user declined. Plain inline styles + one `styles.css`.
- **Bare-metal monitoring scripts** (`prom 2.sh` etc.) superseded by helm kube-prometheus-stack — don't wire both.
- **TF var/resource naming** (hit during typing): var names need underscores — `"instance type"` (space) = parse fail, `"key-name"` (hyphen) breaks `var.key-name` refs (reads as subtraction). Resource type must be exact: `aws_key_pair` not `aws_key_name`. `aws_subnets` (plural data source) returns `.ids` (list), not `.id`.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| No database / no Redis | User requirement; mock data in each service `src/data.js`. Redis was optional cache only → dropped. |
| 3 EC2, single k3s, ArgoCD GitOps | HA story (node-down survival) + impressive grad DevOps. Pull model > appleboy push. |
| Monitoring node in-cluster (not separate bare-metal box) | Helm kube-prom-stack deploys into k8s; pin to EC2-3 via nodeSelector → honors "EC2 for monitoring" + helm. |
| TF in pipeline w/ S3+DynamoDB state, dispatch-only | Avoid infra churn on every app push; remote state safe. |
| Docker Hub registry, tag vX.Y.Z not latest | Creds already in GitHub secrets; real tag needed for ArgoCD diff detection. |
| Alertmanager email on pod failure | Default kube-prom rules; Gmail SMTP app-password as k8s Secret (never in git). |

## File Tree (current — dirs/scaffold exist, files empty unless noted)

```
frontend/  services/  docker-compose.yml          # app (built, working)
infra/
  terraform/  versions.tf variables.tf main.tf outputs.tf terraform.tfvars   (EMPTY)
  ansible/
    ansible.cfg  playbook.yml  group_vars/all.yml  inventory/hosts.ini       (EMPTY)
    roles/{common,k3s_server,k3s_agent,argocd,monitoring}/tasks/main.yml      (EMPTY)
    roles/monitoring/files/values-kube-prom-stack.yaml                        (EMPTY)
Kubernetes/
  {gateway,flight,hotel,weather,currency,frontend}/k3s.yaml   (PLACEHOLDER myapp template)
  monitoring/k3s.yaml   namespace.yaml                        (PLACEHOLDER, wrong kind)
  argocd/application.yaml                                     (EMPTY)
.github/workflows/  infra.yaml  Pipeline.yaml                 (EMPTY)
scripts/  cluster.sh  prom 2.sh  ne 2.sh  gra 2.sh            (old bare-metal, retire into ansible)
```

## App Files to Know

| File | Why |
|------|-----|
| `frontend/src/data/wanderly.js` | Static browse content: `DEST` (16), `CATEGORIES`, `DEALS`, helpers. (Filename kept despite rename.) |
| `frontend/src/pages/Home.jsx` | Snowy hero + glass search + SnowCarousel. |
| `frontend/src/pages/SearchPage.jsx` | LIVE-wired: form → `searchTrip()`, renders flights/hotels/weather. |
| `frontend/src/components/Navbar.jsx` | Glass nav, **plane-window SVG logo**, "Wijha" wordmark, FX selector. |
| `frontend/src/store.jsx` | `useApp()` → `{curr,setCurr,conv,fmt,toast,flash}`. Default `EGP`. |
| `services/gateway/src/index.js` | Fan-out aggregation + currency conversion + optional Redis cache. |

## Resume Instructions

1. App: `docker compose up --build` → http://localhost:8088. Frontend-only: `cd frontend && npm install && npm run dev` (needs gateway :8080 for Search).
2. Verify build: `cd frontend && npm run build`.
3. **DevOps next step = fill files, Terraform first** (nothing deploys until boxes exist). User types, AI guides line-by-line. Order: TF (versions→variables→main→outputs) → ansible roles → rewrite k8s manifests (per-service, real images/ports/probes/HPA) → ArgoCD Application → kube-prom-stack values + Alertmanager email.

## Warnings

- **Boundary**: AI guides DevOps, USER writes/owns it (graded work). Don't bulk-generate infra unless user says "write it"; default is guide-while-they-type.
- TF state MUST be remote (S3+DynamoDB) + gitignored. SMTP/app passwords NEVER in git.
- `kube-prometheus-stack` provides Prometheus+Grafana+Alertmanager+node-exporter — don't also install bare-metal versions.
- No DB on purpose. Don't add one to "complete" Login/Saved/Trips.
- `SmartImage` falls back Unsplash→picsum on error — broken-looking image URLs still render; don't "fix".
- Inline styles carry visuals; `styles.css` only fonts/hover/focus/keyframes/responsive (class hooks `.wl-form`, `.wl-grid3` etc. — keep names).
