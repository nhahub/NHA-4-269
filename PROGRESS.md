# Wijha Travel Aggregator — DevOps Build Log

**Project**: DEPI graduation project (DevOps track).
**App**: microservices travel aggregator (no DB, mock data). One search → flights + hotels + weather, priced in chosen currency. "Glacia" snowy blue UI.
**Boundary**: User does ALL DevOps (graded). AI guides line-by-line; user types every line.

This doc = chronological log of everything done, start → now (2026-06-30).

---

## Phase 0 — App (pre-existing, built earlier)

- 5 Node/Express microservices: `gateway` (fan-out/aggregate), `flight`, `hotel`, `weather`, `currency`. Each has `/health` + `/metrics` (prom-client).
- React 18 + Vite + Router frontend, 12 pages, Glacia theme, brand "Wijha".
- `docker-compose.yml` for local run. Build verified.

---

## Phase 1 — Terraform (provision 3 EC2)

**Goal**: 3 EC2 boxes in AWS for a k3s cluster.

1. **Backend bootstrap** (one-time, manual): S3 bucket `wijha-tfstate-amir01` (versioned) + DynamoDB lock table `wijha-tf-lock`, both `us-east-1`. AWS account `533590176269`.
2. **SSH key**: generated `~/.ssh/id_ed25519` (ed25519, no passphrase). TF uploads pubkey as AWS key pair `wijha-key`.
3. **TF files** (`infra/terraform/`): `versions.tf` (TF ≥1.6, AWS ~>5, S3 backend), `variables.tf`, `main.tf` (Ubuntu 22.04 AMI, default VPC, key pair, security group, 3× `aws_instance` for_each server/app/monitoring), `outputs.tf` (public/private IPs, ssh commands).
4. **Security group**: SSH 22, NodePort 30000-32767, intra-cluster self; egress all. No 6443 (kubectl via SSH on server).
5. `terraform init` → `validate` → `plan` (5 to add) → **`apply` DONE**.

**Result — 3 EC2 live (us-east-1)**:

| Name | Public IP | Private IP | Role |
|------|-----------|-----------|------|
| wijha-server | 3.238.250.18 | 172.31.65.27 | k3s control plane + ArgoCD |
| wijha-app | 3.236.171.218 | 172.31.79.238 | k3s agent (app workloads) |
| wijha-monitoring | 3.238.198.185 | 172.31.66.80 | k3s agent (monitoring, labeled role=monitoring) |

All 3× t3.small, 40GB gp3. SSH verified OK.
⚠️ **Billing live** — `terraform destroy` when done. Public IPs change on stop/start → repaste into ansible inventory.
⚠️ Watch AWS console region — TF is **us-east-1** (N. Virginia), not eu-north.

---

## Phase 2 — Ansible (configure nodes → k3s cluster + ArgoCD + monitoring)

All in `infra/ansible/`. Run: `cd infra/ansible && ansible-playbook playbook.yml`.

### Foundation

- **`ansible.cfg`** — remote_user ubuntu, private key `~/.ssh/id_ed25519`, host_key_checking off, become sudo root.
- **`inventory/hosts.ini`** — groups `[server]`/`[app]`/`[monitoring]`; `[agents:children]`=app+monitoring; `[k3s:children]`=all. Each host: `ansible_host`(public IP) + `private_ip`. Monitoring host adds `node_label="--node-label role=monitoring"`.
- **`group_vars/all.yml`** — python3 interpreter, `k3s_version: v1.30.5+k3s1`, `server_private_ip`, `node_label: ""` (default; monitoring host overrides).
- **`playbook.yml`** — 5 plays in order: common(all) → k3s_server(server) → k3s_agent(agents) → argocd(server) → monitoring(server).
- Connectivity verified: `ansible all -m ping` → 3× pong. ✅

### Roles

1. **common** (all nodes) — apt update with retry loop (waits out cloud-init lock), base packages (curl, apt-transport-https, ca-certificates), swapoff (k3s req). (Dropped a timezone task — `ansible.builtin.timezone` not in builtin collection; boxes already UTC.)

2. **k3s_server** (server) — installs k3s server pinned version; `--node-ip`/`--advertise-address`=private IP, `--tls-san`=public IP, kubeconfig mode 644. Waits for node-token, slurps + decodes it into facts `k3s_token` + `k3s_url` (agents read via `hostvars`). Waits for API ready.

3. **k3s_agent** (app + monitoring) — installs k3s agent, joins cluster via `K3S_URL`+`K3S_TOKEN` from server facts; `--node-ip`=private; applies `{{ node_label }}` (monitoring gets role=monitoring). **Verified: 3 nodes joined, all Ready.** ✅

4. **argocd** (server) — creates `argocd` namespace, installs official ArgoCD manifest (`--server-side=true --force-conflicts` to dodge the applicationsets CRD 262144-byte annotation limit), patches `argocd-server` svc to NodePort 30443, waits rollout, reads `argocd-initial-admin-secret`, prints password. **Verified: installed.** ✅
   - UI: `https://3.238.250.18:30443` · user `admin` · pass from playbook output (rotate after demo).

5. **monitoring** (server, pods pinned to monitoring node) — installs Helm, adds prometheus-community repo, `helm upgrade --install kube-prometheus-stack` into `monitoring` ns with custom values. **DONE + VERIFIED.** ✅
   - Values (`roles/monitoring/files/values-kube-prom-stack.yaml`): NodePorts Prometheus 30090 / Alertmanager 30093 / Grafana 30030; each pinned via `nodeSelector role=monitoring`; grafana admin password set; node-exporter auto DaemonSet on all nodes.
   - One helm chart replaces the old bare-metal scripts (`prom 2.sh`/`gra 2.sh`/`ne 2.sh`) — those RETIRE.
   - Verified (2026-06-30): all stack pods Running on `wijha-monitoring` (172.31.66.80); node-exporter DaemonSet = 1/node (3 total); Grafana up at `http://3.238.198.185:30030` (admin/admin), all default dashboards + Prometheus datasource provisioned.
   - ⚠️ First run hit transient GitHub 500 fetching chart tgz — retry cleared it. If recurs: pin `--version` or `helm repo update`.

---

## Phase 3 — Kubernetes manifests (rewrite per-service) ✅

Replaced placeholder `myapp` garbage with real per-service manifests in `Kubernetes/`.

- **`namespace.yaml`** — real `Namespace` kind `wijha` (was wrongly a Deployment copy).
- **6 services** (`Kubernetes/{gateway,flight,hotel,weather,currency,frontend}/k3s.yaml`), each = Deployment + Service (+ HPA where relevant):
  - `replicas: 2`, `podAntiAffinity` (spread across nodes, HA), `nodeSelector role=app` (keep off monitoring node).
  - liveness + readiness probes on `/health` (frontend probes `/`), resources requests+limits.
  - HPA (autoscaling/v2, CPU 70%, min 2 / max 4).
  - **gateway**: NodePort **30080**, env upstream URLs (`http://flight-service:8081` … currency 8084) + `CACHE_TTL_SECONDS` (no Redis → cache graceful-off).
  - **4 backends**: ClusterIP, ports 8081/8082/8083/8084.
  - **frontend**: NodePort **30088**, port 80 (nginx static, proxies `/api/`→`gateway:8080`).
- **Service names MUST match compose DNS** (`flight-service` etc.) — gateway envs + nginx depend on them.
- **`Kubernetes/monitoring/` DELETED** — helm owns monitoring, not ArgoCD.
- **ArgoCD Application** = `argocd/application.yaml` at **repo root** (NOT inside `Kubernetes/` — keeps Argo from self-managing). Watches repo `Kubernetes/`, branch main, automated sync (prune+selfHeal), CreateNamespace. Apply by hand once: `kubectl apply -f argocd/application.yaml`.
- Pre-sync prereqs: label app node `kubectl label node wijha-app role=app`; HPA needs metrics-server (k3s ships it).

## Phase 4 — CI/CD (GitHub Actions) — IN PROGRESS (friend taking this; may move to Jenkins later)

- **GitHub repo**: `nhahub/NHA-4-269`. **Secrets all set**: `DOCKERUSERNAME`, `DOCKERPASSWORD` (Docker Hub access token), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SSH_PRIVATE_KEY` (contents of `~/.ssh/id_ed25519`).
- **Guide written**: `PHASE4-CI-GUIDE.md` (repo root) — standalone, type-it-yourself, full content for both workflows + why-each-part + test steps + Jenkins-mapping table. NOT yet typed into `.github/workflows/`.
- **Decided: marketplace actions only, no custom shell glue.**
  - **`deploy.yaml`**: on push main (paths `services/**`,`frontend/**`,self) → `docker/login-action` + matrix `docker/build-push-action` 6 images tag=`github.sha` → `bump-tags` job: `fjogeleit/yaml-update-action` sets image in each `Kubernetes/*/k3s.yaml` → `stefanzweifel/git-auto-commit-action` commit+push (`[skip ci]`, paths-guard = no retrigger loop). Dir→image map: `flight-service`→`wijha-flight` (drops `-service`); frontend ctx `./frontend`.
  - **`infra.yaml`**: `workflow_dispatch` (choice plan/apply/destroy + bool run_ansible). `aws-actions/configure-aws-credentials` → `dflook/terraform-{plan,apply,destroy}` (wraps init+apply+outputs, reads S3 backend) → ansible job: `shimataro/ssh-key-action` + `dawidd6/action-ansible-playbook` (inline inventory). IPs from dflook outputs `node_public_ips`/`node_private_ips` via `fromJSON()` — no manual parse, no placeholders.
- **Tag strategy = git commit SHA** (not vX.Y.Z): unique per push, zero manual bumping, Argo always sees a diff.
- **⚠️ SECURITY**: AWS key `AKIAXYPDT6IG3N7AYSPZ` leaked via screenshot → **must rotate** in IAM + update secrets before any apply. AWS keys were in plaintext `~/Documents/*.txt` — move to a password manager.

---

## Phase 4 — IMPLEMENTED on Eyad branch (2026-07-03)

Eyad wrote the CI — but **took a different path than `PHASE4-CI-GUIDE.md`**.

- **`.github/workflows/CICD-Pipeline.yml`** — one workflow, 2 jobs, push on `Eyad`+`main`:
  1. **build** — docker login + 6× build-push (`docker/build-push-action@v7`). Contexts `services/{currency,flight,gateway,hotel,weather}-service` + `./frontend`. Tags `<user>/<svc>-service:latest`.
  2. **deploy** (`needs: build`) — `appleboy/ssh-action` SCPs `Kubernetes/` to server, runs `kubectl apply` on namespace + 6 manifests.
- Renamed `services/gateway` → `services/gateway-service` (leftover untracked `gateway/node_modules` locally).
- k8s manifests: images → `amirazzamm/<svc>-service:latest`; old `wijha-*:v1.0.0` commented.

**DECISION (2026-07-03): ArgoCD DROPPED — appleboy push is the deploy model.** GitOps pull retired. Repo changes done: deleted `argocd/application.yaml` + `roles/argocd/`; removed `argocd` play from `playbook.yml`.

**Open TODO for appleboy path:**
- **Live cluster still runs ArgoCD** — `kubectl delete ns argocd` on server (orphaned now).
- **`latest` tag** — `kubectl apply` of unchanged manifest won't roll pods unless `imagePullPolicy: Always` + `kubectl rollout restart`. Fix or switch to SHA tags.
- **Secrets** `EC2_HOST_IP` + `EC2_USERNAME` not set — deploy fails without them.
- **No `infra.yaml`** — Terraform still manual; empty `Pipeline.yaml`/`infra.yaml` stubs remain (fail every push).

## Architecture (decided)

**3× EC2, single k3s cluster, GitOps via ArgoCD.**

- **EC2-1 server**: k3s control plane + ArgoCD (NodePort 30443).
- **EC2-2 app**: 6 app deployments (frontend+gateway NodePort, 4 backends ClusterIP), replicas:2 + HPA + podAntiAffinity.
- **EC2-3 monitoring**: kube-prometheus-stack (Prometheus 30090, Alertmanager 30093, Grafana 30030), node-exporter DaemonSet. Pinned via nodeSelector role=monitoring.

**GitOps flow**: CI builds → pushes image (Docker Hub `amirazzamm/wijha-*`, tag = **git SHA**) → bumps tag in `Kubernetes/*/k3s.yaml` → commits main. ArgoCD (in cluster) watches `Kubernetes/` path → auto-syncs → pods. (Tag = SHA not vX.Y.Z: auto-unique per push, no manual bump, Argo always detects change.)

**HA**: multi-node + replicas:2 + podAntiAffinity → node dies, pods reschedule. HPA = pod autoscale on CPU.

---

## Still To Do

- [x] ~~Finish + run **monitoring** role~~ — DONE + verified.
- [x] ~~**ArgoCD Application** manifest~~ — DONE (`argocd/application.yaml` at repo root). NOT yet applied to cluster.
- [x] ~~**Rewrite k8s manifests** per-service~~ — DONE (Phase 3).
- [ ] **Friend writes `deploy.yaml` + `infra.yaml`** from `PHASE4-CI-GUIDE.md` (all secrets ready).
- [ ] **⚠️ Rotate leaked AWS key** (`AKIA...` shown in screenshot) before any infra apply.
- [ ] **Push repo to GitHub** (`nhahub/NHA-4-269`) → triggers deploy.yaml → 6 images to Docker Hub.
- [ ] **Apply ArgoCD App**: `kubectl apply -f argocd/application.yaml`; label app node `role=app`. Then Argo syncs → pods up.
- [ ] **Alertmanager email** — Gmail SMTP via app-password as k8s Secret (NEVER in git).
- [ ] Remove Redis from compose + gateway (decided, not executed).
- [ ] `git rm scripts/` (old bare-metal) — user chose to KEEP for now.
- [x] **PUSHED to GitHub** (2026-06-30, commit `cec11fc`) — `nhahub/NHA-4-269`, branches `main` + `Eyad` (friend's Phase 4 branch). `.gitignore` ignores `*.tfvars` + `.claude/`.
- [ ] **2 empty workflow stubs** (`infra.yaml`, `Pipeline.yaml`) FAIL on every push (empty = no jobs). Kept on purpose; go green/away once friend fills them.
- [ ] **⚠️ Docs pushed with live secrets** (ArgoCD pw, AWS key id) — rotate both.

---

## Key Conventions / Gotchas

- TF state remote (S3+DynamoDB), gitignored. Secrets (SMTP/app-passwords) NEVER in git.
- k3s server runs kubectl/helm (has kubeconfig); agents don't. Monitoring helm runs on server, pods pinned to monitoring node via label.
- Image tags must be real versions (vX.Y.Z), not `latest`, or ArgoCD won't detect change.
- ArgoCD install needs `--server-side` (CRD too big for client apply).
- No database by design — don't add one.
