# PrepifyAI Backend Deployment on AWS (Free Tier First)

This guide deploys the backend in this repository to AWS with Free Tier cost control as the default goal.

## 1) Target Architecture

- **EC2 (Ubuntu, Free Tier eligible)**: runs FastAPI backend
- **Docker Compose**: runs PostgreSQL + pgvector (and optional Redis) on the same EC2
- **EBS volume**: persistent storage for PostgreSQL data
- **Nginx + Let's Encrypt**: HTTPS reverse proxy in front of FastAPI
- **CloudWatch + Billing alarm**: basic observability and spend protection

This architecture fits the current backend requirements (pgvector, OCR tools, heavy Python ML dependencies) better than Lambda/API Gateway.

---

## 2) AWS Services to Use vs Avoid

### Use
- EC2
- EBS
- Security Groups
- IAM user/role
- CloudWatch

### Avoid initially (cost control)
- ALB/ELB
- ElastiCache
- NAT Gateway
- ECS/Fargate

---

## 3) Prerequisites

1. AWS account with billing alerts enabled.
2. An SSH key pair in your AWS region.
3. (Optional) Domain name if you want custom HTTPS hostnames.

---

## 4) Launch EC2

1. Launch **Ubuntu 22.04 LTS** (Free Tier eligible type like `t2.micro`/`t3.micro` where available).
2. Set root volume to **20–30 GB gp3**.
3. Attach Security Group rules:
   - Inbound `22` from **your IP only**
   - Inbound `80` from `0.0.0.0/0`
   - Inbound `443` from `0.0.0.0/0`
   - **Do not expose PostgreSQL/Redis ports publicly**
4. Attach IAM role with CloudWatch agent permissions (if using log shipping).

---

## 5) SSH and Server Bootstrap

```bash
ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates gnupg lsb-release
```

Install Docker + Compose plugin:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

Install OCR system dependencies used by this backend:

```bash
sudo apt install -y tesseract-ocr poppler-utils
```

---

## 6) Clone and Prepare the App

```bash
git clone https://github.com/AmeerHamza2579/PREPIFYAI.git
cd PREPIFYAI
```

Create production env file from template:

```bash
cp app/.env.production.example app/.env
```

Edit `app/.env` and set secure real values:
- `DATABASE_URL`
- `SECRET_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `GROQ_API_KEY` (if required)
- `REDIS_URL` (only if Redis enabled)

Required production flags:
- `USE_PGVECTOR=true`
- `DEBUG_API=false`
- `ENSURE_DEFAULT_ADMIN=false` (after initial admin setup)
- `PAST_PAPERS_JSON_AUTOLOAD=false` (after first successful seed)
- `TESSERACT_PATH=/usr/bin/tesseract`

---

## 7) Start Database Services (Compose)

From repository root:

```bash
docker compose up -d postgres
# optional cache:
# docker compose up -d redis
```

Enable pgvector extension:

```bash
docker exec prepifyai_postgres psql -U postgres -d PrepifyAI_Main -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

---

## 8) Install Python Dependencies and Run Backend

```bash
cd /home/ubuntu/PREPIFYAI
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r app/requirements.txt
```

Run migrations:

```bash
cd /home/ubuntu/PREPIFYAI/app
alembic -c alembic.ini upgrade head
```

Start API (production-style, no reload):

```bash
cd /home/ubuntu/PREPIFYAI
uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
```

---

## 9) Add Nginx Reverse Proxy + HTTPS

Install Nginx and Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create Nginx site:

```nginx
server {
    listen 80;
    server_name <YOUR_DOMAIN_OR_EC2_DNS>;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

Issue certificate:

```bash
sudo certbot --nginx -d <YOUR_DOMAIN>
```

If you do not use a domain, keep HTTP on EC2 public DNS until domain is available.

---

## 10) Make Backend Persistent with systemd

Create service file `/etc/systemd/system/prepifyai-api.service`:

```ini
[Unit]
Description=PrepifyAI FastAPI Backend
After=network.target docker.service

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/PREPIFYAI
EnvironmentFile=/home/ubuntu/PREPIFYAI/app/.env
ExecStart=/home/ubuntu/PREPIFYAI/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable prepifyai-api
sudo systemctl restart prepifyai-api
sudo systemctl status prepifyai-api
```

Also ensure Docker starts on boot:

```bash
sudo systemctl enable docker
```

---

## 11) Health and Smoke Tests

```bash
curl -I http://127.0.0.1:8000/
curl -I http://127.0.0.1:8000/docs
curl -I https://<YOUR_DOMAIN>/docs
curl -I https://<YOUR_DOMAIN>/health/db
```

From Android app:
- Set backend base URL to your HTTPS endpoint.
- Verify login token flow.
- Verify file upload endpoints and question generation endpoints.

---

## 12) Cost and Operations Checklist

### Daily
- Check EC2 CPU/RAM/disk usage.
- Check app and docker logs.

### Weekly
- Verify Postgres backup snapshot/export.
- Verify TLS renewal status.

### Monthly
- Review AWS billing and Free Tier usage.
- Rotate app secrets when needed.

---

## 13) Scale Path (When Needed)

When load increases beyond Free Tier capacity:
1. Move PostgreSQL from Docker-on-EC2 to RDS PostgreSQL.
2. Keep API on EC2 initially, then move to ECS only when needed.
3. Add Redis managed service later if caching demand grows.

---

## 14) Important Notes for This Repository

- Current code supports optional Redis; if `REDIS_URL` is unset, cache calls no-op.
- OCR-heavy endpoints require `tesseract-ocr` and `poppler-utils`.
- `USE_PGVECTOR=true` should remain enabled for vector operations.
- Default admin auto-bootstrap is for development convenience; disable it in production after initial setup.
