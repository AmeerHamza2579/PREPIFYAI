# PrepifyAI — Beginner's Click-by-Click Deployment Manual

> **How to use this guide**: This is a strict chronological checklist.
> Complete each numbered step fully before continuing to the next.
> Every command block is designed to be copy-pasted verbatim — the only substitutions
> you must make are marked in `<ANGLE_BRACKETS>`.

---

## ✅ PHASE 0 — One-Time AWS Account Setup

### Step 0.1 — Create your AWS account
1. Go to **https://aws.amazon.com** and click **Create an AWS Account**.
2. Fill in email address → **Root user email** → click **Verify email address**.
3. Enter the 6-digit verification code AWS emails you.
4. Choose **Personal** account type.
5. Fill in payment card details (required even for Free Tier — you will not be charged if you stay in limits).
6. Complete the identity verification phone call / SMS.
7. Select **Basic Support (Free)**.
8. Click **Complete sign up**.

### Step 0.2 — Set a billing alarm (do this before anything else)
> This protects you from surprise charges.

1. Sign in → top-right corner click your account name → **Account**.
2. In the left sidebar click **Billing preferences**.
3. Under **Invoice delivery preferences** enable **PDF invoices by email**.
4. In the left sidebar click **Budgets** → **Create budget**.
5. Choose **Use a template** → **Zero spend budget** → click **Next**.
6. Enter your email address under **Email recipients** → click **Create budget**.
7. ✅ You will now receive an email if you go above \$0 of spending.

---

## ✅ PHASE 1 — Launch the EC2 Instance (Click-by-Click)

### Step 1.1 — Navigate to EC2
1. Click the search bar at the top of the AWS console.
2. Type **EC2** → click **EC2** in the results.
3. On the EC2 Dashboard, click the orange button **Launch instance**.

### Step 1.2 — Name the instance
- In the **Name** field type: `prepifyai-backend`

### Step 1.3 — Choose OS (AMI)
1. Under **Application and OS Images (Amazon Machine Image)** click the **Ubuntu** tile.
2. In the dropdown that appears confirm it reads: `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`.
3. Under **Architecture** leave it as `64-bit (x86)`.
4. ⚠️ Confirm the label **Free tier eligible** appears below the AMI name.

### Step 1.4 — Choose instance type
1. Under **Instance type** click the dropdown and type `t3.micro`.
2. Select **t3.micro** from the list.
3. ⚠️ Confirm the **Free tier eligible** badge is shown.
   > If t3.micro is not Free Tier in your region, select **t2.micro** instead.

### Step 1.5 — Create a key pair (SSH access)
1. Under **Key pair (login)** click **Create new key pair**.
2. **Key pair name**: `prepifyai-key`
3. **Key pair type**: `RSA`
4. **Private key file format**:
   - If you are on **Mac or Linux**: choose `.pem`
   - If you are on **Windows**: choose `.ppk` *only* if you plan to use PuTTY; otherwise choose `.pem` (PowerShell works with `.pem`)
5. Click **Create key pair**.
6. Your browser will automatically download a file named `prepifyai-key.pem`.
7. ⚠️ **Move this file somewhere safe immediately** — you cannot download it again.
   - Suggested location: `~/aws-keys/prepifyai-key.pem` on Mac/Linux
   - Suggested location: `C:\Users\YourName\aws-keys\prepifyai-key.pem` on Windows

### Step 1.6 — Configure Network Settings (Security Group)
1. Under **Network settings** click the **Edit** button (top-right of the Network settings panel).
2. Leave **VPC** and **Subnet** as their defaults.
3. **Auto-assign public IP**: `Enable`
4. Under **Firewall (security groups)** select **Create security group**.
5. **Security group name**: `prepifyai-sg`
6. **Description**: `PrepifyAI backend - SSH + HTTP + HTTPS`
7. You will see a default rule already added for SSH (port 22). **Change it**:
   - Under **Source type** for the SSH rule, change `Anywhere` to **My IP**.
   - AWS automatically fills in your current IP address. This limits SSH access to your machine only.
8. Click **Add security group rule** and fill in:
   - **Type**: `HTTP` | **Protocol**: `TCP` | **Port**: `80` | **Source type**: `Anywhere` (`0.0.0.0/0`)
9. Click **Add security group rule** again:
   - **Type**: `HTTPS` | **Protocol**: `TCP` | **Port**: `443` | **Source type**: `Anywhere` (`0.0.0.0/0`)
10. ⚠️ Do **not** add rules for ports `5432`, `5433`, or `6379` — the database and Redis must never be publicly reachable.

### Step 1.7 — Configure Storage
1. Under **Configure storage** change the size from `8 GiB` to `25 GiB`.
2. Leave volume type as `gp3`.

### Step 1.8 — Launch
1. Review the **Summary** panel on the right. Confirm:
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.micro (or t2.micro)
   - Key pair: prepifyai-key
   - Storage: 25 GiB gp3
2. Click the orange **Launch instance** button.
3. Click **View all instances**.
4. Wait until the **Instance state** column shows `Running` and **Status check** shows `2/2 checks passed` (takes ~1 minute, refresh the page).

### Step 1.9 — Note your EC2 Public IP
1. Click on your instance name `prepifyai-backend` in the list.
2. In the details panel below look for **Public IPv4 address**.
3. 📋 Copy this IP address and paste it somewhere — you will need it repeatedly.
   > Example: `54.123.45.67`
4. Also note the **Public IPv4 DNS** (looks like `ec2-54-123-45-67.compute-1.amazonaws.com`).
   > You can use the DNS name instead of the IP everywhere below.

---

## ✅ PHASE 2 — Connect to Your Server (SSH)

### Step 2.1 — Mac / Linux: set .pem permissions and connect

Open **Terminal** and run these commands exactly:

```bash
# Step 1: lock down the key file (SSH refuses to use it if world-readable)
chmod 400 ~/aws-keys/prepifyai-key.pem

# Step 2: SSH into your server (replace with your real Public IPv4 address)
ssh -i ~/aws-keys/prepifyai-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

> Example:
> ```bash
> ssh -i ~/aws-keys/prepifyai-key.pem ubuntu@54.123.45.67
> ```

When prompted `Are you sure you want to continue connecting (yes/no)?` type `yes` and press Enter.

You should now see a prompt like `ubuntu@ip-172-31-xx-xx:~$` — you are inside your server. ✅

### Step 2.2 — Windows (PowerShell): set .pem permissions and connect

Open **PowerShell** (search Start menu → `PowerShell`) and run:

```powershell
# Step 1: remove inherited permissions from the key file
$keyPath = "C:\Users\YourName\aws-keys\prepifyai-key.pem"
icacls $keyPath /inheritance:r
icacls $keyPath /grant:r "$($env:USERNAME):(R)"

# Step 2: SSH in (PowerShell 7+ or Windows 10 1809+ has built-in ssh.exe)
ssh -i "C:\Users\YourName\aws-keys\prepifyai-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

> If you get `ssh is not recognized`, install it:
> Settings → Apps → Optional Features → **Add a feature** → **OpenSSH Client** → Install → restart PowerShell.

When prompted `Are you sure you want to continue connecting?` type `yes` and press Enter.

---

## ✅ PHASE 3 — Create a Swap File (Critical for t3.micro)

> t3.micro has only **1 GB of RAM**. Without swap, `pip install` will kill the server.
> Run all these commands while connected via SSH.

```bash
# 1. Create a 2 GB swap file
sudo fallocate -l 2G /swapfile

# 2. Lock it to root only
sudo chmod 600 /swapfile

# 3. Format it as swap
sudo mkswap /swapfile

# 4. Activate it now
sudo swapon /swapfile

# 5. Verify it is active (you should see a row with 'partition' type showing 2G)
sudo swapon --show

# 6. Make it permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 7. Tune swappiness so swap is used conservatively
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl vm.swappiness=10
```

✅ Your server can now survive heavy `pip install` runs without crashing.

---

## ✅ PHASE 4 — Full Server Bootstrap (Copy-Paste Sequence)

Run every command below **in order**, one at a time. Wait for each to finish before running the next.

```bash
# 1. Update package lists
sudo apt update

# 2. Upgrade existing packages (press Enter if prompted with a menu — choose default)
sudo apt upgrade -y

# 3. Install basic tools
sudo apt install -y git curl ca-certificates gnupg lsb-release

# 4. Create directory for Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings

# 5. Download Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 6. Add Docker's official package repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 7. Update package lists again (now includes Docker)
sudo apt update

# 8. Install Docker engine + Compose plugin
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 9. Add your user to the docker group (so you don't need sudo for every docker command)
sudo usermod -aG docker $USER

# 10. Apply the group change without logging out
newgrp docker

# 11. Verify Docker is working
docker run --rm hello-world
```

> ✅ You should see `Hello from Docker!` printed. If you do, Docker is working.

```bash
# 12. Install OCR tools needed by PrepifyAI
sudo apt install -y tesseract-ocr poppler-utils

# 13. Verify tesseract installed
tesseract --version

# 14. Install Python 3 and pip
sudo apt install -y python3 python3-pip python3-venv

# 15. Enable and start Docker on every reboot
sudo systemctl enable docker
sudo systemctl start docker
```

---

## ✅ PHASE 5 — Clone the Repo and Configure the App

```bash
# 16. Go to your home directory
cd ~

# 17. Clone the repository
git clone https://github.com/AmeerHamza2579/PREPIFYAI.git

# 18. Enter the project folder
cd PREPIFYAI

# 19. Copy the production env template
cp app/.env.production.example app/.env
```

Now edit the env file. Use the `nano` text editor:

```bash
# 20. Open the env file in nano
nano app/.env
```

Inside nano, update every value marked `CHANGEME` or `REPLACE`:

| Variable | What to set |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:i222579@localhost:5433/PrepifyAI_Main` (match docker-compose.yml defaults, or use a custom password) |
| `SECRET_KEY` | Run `openssl rand -hex 32` in another terminal and paste the result |
| `ADMIN_EMAIL` | Your real admin email address |
| `ADMIN_PASSWORD` | A strong password (min 12 chars, mix of letters/numbers/symbols) |
| `GROQ_API_KEY` | Your Groq API key (get one free at https://console.groq.com) — leave commented out if you don't need LLM yet |
| `ENSURE_DEFAULT_ADMIN` | Set to `true` for the first start only, then back to `false` |
| `TESSERACT_PATH` | `/usr/bin/tesseract` (already correct in the template) |

> **Nano keyboard shortcuts**: `Ctrl+O` = save, `Enter` = confirm filename, `Ctrl+X` = exit.

```bash
# 21. Generate a secure secret key (copy the output and paste it into SECRET_KEY in nano)
openssl rand -hex 32
```

---

## ✅ PHASE 6 — Start the Database Containers

```bash
# 22. From the project root, start Postgres (pgvector image)
cd ~/PREPIFYAI
docker compose up -d postgres

# 23. Check it started correctly (State should show "healthy" after ~15 seconds)
docker compose ps

# 24. Enable the pgvector extension inside the database
docker compose exec -T postgres psql -U postgres -d PrepifyAI_Main -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

> ✅ You should see `CREATE EXTENSION` printed. That means pgvector is active.

---

## ✅ PHASE 7 — Install Python Dependencies and Run Migrations

```bash
# 25. Create a Python virtual environment
cd ~/PREPIFYAI
python3 -m venv .venv

# 26. Activate the virtual environment
source .venv/bin/activate
# Your prompt will change to: (.venv) ubuntu@...

# 27. Upgrade pip first
pip install --upgrade pip

# 28. Install all project dependencies
# This will take several minutes on t3.micro — the swap file from Phase 3 prevents crashes
pip install -r app/requirements.txt

# 29. Run Alembic database migrations
cd ~/PREPIFYAI/app
alembic -c alembic.ini upgrade head
```

> ✅ If migrations succeed you will see lines like `Running upgrade -> abc123, create users table`.
> Any error here usually means the DATABASE_URL in `.env` does not match what's in `docker-compose.yml`.

---

## ✅ PHASE 8 — Test the API Is Running

```bash
# 30. Go back to the project root
cd ~/PREPIFYAI

# 31. Wait for Postgres to be fully ready
timeout 60 bash -c 'until docker compose exec -T postgres pg_isready -U postgres -d PrepifyAI_Main; do sleep 2; done'

# 32. Start the FastAPI server (foreground for now — just to test)
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

Open a **new terminal / new SSH connection** and run:

```bash
# 33. In the new SSH session, test the API is responding
curl -I http://127.0.0.1:8000/docs
```

> ✅ You should see `HTTP/1.1 200 OK`. Press `Ctrl+C` in the first terminal to stop the test server.

---

## ✅ PHASE 9 — Set Up Nginx + HTTPS

### Step 9.1 — Install Nginx and Certbot

```bash
# 34. Install nginx and certbot
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 9.2 — Create Nginx site config

> **If you have a domain name**: use it in place of `<YOUR_DOMAIN_OR_IP>`.
> **If you do not have a domain**: use the EC2 Public IPv4 DNS value from Step 1.9 (e.g. `ec2-54-123-45-67.compute-1.amazonaws.com`). Note: Let's Encrypt requires a real domain; without one, you can only use HTTP.

```bash
# 35. Create a new nginx config for PrepifyAI
sudo nano /etc/nginx/sites-available/prepifyai
```

Paste this entire block into nano (replace `<YOUR_DOMAIN_OR_IP>` with your real value):

```nginx
server {
    listen 80;
    server_name <YOUR_DOMAIN_OR_IP>;

    client_max_body_size 200M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

Save and exit nano (`Ctrl+O` → `Enter` → `Ctrl+X`).

```bash
# 36. Enable the site
sudo ln -s /etc/nginx/sites-available/prepifyai /etc/nginx/sites-enabled/

# 37. Remove the default site to avoid conflicts
sudo rm -f /etc/nginx/sites-enabled/default

# 38. Test nginx config
sudo nginx -t
# Expected output: "syntax is ok" and "test is successful"

# 39. Reload nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

### Step 9.3 — Enable HTTPS with Let's Encrypt (only if you have a real domain)

```bash
# 40. Issue TLS certificate (replace with your real domain)
sudo certbot --nginx -d <YOUR_DOMAIN>
# Certbot will ask for your email and prompt you to agree to terms
# Choose option 2 (Redirect) when asked about HTTP → HTTPS redirect
```

> ✅ After success, visit `https://<YOUR_DOMAIN>/docs` in your browser — you should see the FastAPI Swagger UI over HTTPS.

---

## ✅ PHASE 10 — Make the Backend Persistent with systemd

Without this, the API stops when you close your SSH session.

```bash
# 41. Create the systemd service file
sudo nano /etc/systemd/system/prepifyai-api.service
```

Paste this entire block:

```ini
[Unit]
Description=PrepifyAI FastAPI Backend
Requires=docker.service
After=network.target docker.service

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/PREPIFYAI
EnvironmentFile=/home/ubuntu/PREPIFYAI/app/.env
ExecStartPre=/usr/bin/docker compose -f /home/ubuntu/PREPIFYAI/docker-compose.yml up -d postgres
ExecStartPre=/usr/bin/timeout 60 /bin/bash -c 'until /usr/bin/docker compose -f /home/ubuntu/PREPIFYAI/docker-compose.yml exec -T postgres pg_isready -U postgres -d PrepifyAI_Main; do sleep 2; done'
ExecStart=/home/ubuntu/PREPIFYAI/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Save and exit (`Ctrl+O` → `Enter` → `Ctrl+X`).

```bash
# 42. Reload systemd so it sees the new file
sudo systemctl daemon-reload

# 43. Enable the service (auto-start on reboot)
sudo systemctl enable prepifyai-api

# 44. Start it now
sudo systemctl start prepifyai-api

# 45. Check it started successfully
sudo systemctl status prepifyai-api
# You should see: Active: active (running)

# 46. Watch live logs if you want to confirm it's healthy
sudo journalctl -u prepifyai-api -f
# Press Ctrl+C to stop watching
```

---

## ✅ PHASE 11 — First Admin Setup

```bash
# 47. Temporarily enable admin auto-bootstrap
nano ~/PREPIFYAI/app/.env
# Change: ENSURE_DEFAULT_ADMIN=false  →  ENSURE_DEFAULT_ADMIN=true
# Save and exit

# 48. Restart the API so it picks up the change
sudo systemctl restart prepifyai-api

# 49. Verify admin was created (look for "Default admin user created" in logs)
sudo journalctl -u prepifyai-api --no-pager | grep -i admin

# 50. Disable auto-bootstrap again (important for security)
nano ~/PREPIFYAI/app/.env
# Change: ENSURE_DEFAULT_ADMIN=true  →  ENSURE_DEFAULT_ADMIN=false
# Save and exit

# 51. Restart once more
sudo systemctl restart prepifyai-api
```

---

## ✅ PHASE 12 — Connect Your React Native Android App

### Step 12.1 — Find your EC2 Public IP

1. Go to the **AWS EC2 console** (https://console.aws.amazon.com/ec2).
2. Click **Instances** in the left sidebar.
3. Click on `prepifyai-backend`.
4. In the **Details** panel below look for **Public IPv4 address** — for example `54.123.45.67`.
5. If you have HTTPS set up with a domain, use your domain name instead: `https://api.yourdomain.com`.

> ⚠️ The EC2 **Public IPv4 address may change** every time the instance is restarted unless you attach an **Elastic IP** (free while the instance is running).
>
> To attach a static IP:
> 1. In the EC2 console left sidebar click **Elastic IPs**.
> 2. Click **Allocate Elastic IP address** → **Allocate**.
> 3. Select the newly created IP → **Actions** → **Associate Elastic IP address**.
> 4. Select your instance → **Associate**.
> 5. This IP never changes as long as it is associated with a running instance.

### Step 12.2 — Where to update the base URL in your React Native app

Search your React Native / Expo project for any file that defines the API base URL. Common patterns to look for:

```bash
# Run this from your React Native project root on your LOCAL machine (not EC2)
grep -r "localhost\|127.0.0.1\|BASE_URL\|API_URL\|baseURL\|baseUrl" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.env" .
```

Common file locations where you will find the URL to replace:

| File | What to change |
|---|---|
| `src/config/api.ts` or `src/config/config.ts` | `BASE_URL` or `API_URL` constant |
| `.env` or `.env.production` | `EXPO_PUBLIC_API_URL` or similar |
| `src/services/apiService.ts` | `axios.create({ baseURL: '...' })` |
| `src/api/client.ts` | `new ApiClient('...')` |

Replace the old development URL with your production URL:

```typescript
// Before (development)
const BASE_URL = 'http://192.168.1.x:8000';

// After (production — with HTTPS domain)
const BASE_URL = 'https://api.yourdomain.com';

// After (production — with EC2 IP only, HTTP)
const BASE_URL = 'http://54.123.45.67';
```

> ⚠️ If your React Native app targets **Android 9+**, cleartext HTTP (non-HTTPS) is blocked by default.
> Either use HTTPS, or add this to `android/app/src/main/AndroidManifest.xml`:
> ```xml
> <application android:usesCleartextTraffic="true" ...>
> ```
> This is fine for testing only — always use HTTPS for production builds.

### Step 12.3 — Test from a real Android device

1. Connect your Android phone to the same Wi-Fi as your development computer **or** use mobile data.
2. Build and run the app in development mode: `npx expo start` or `npx react-native run-android`.
3. In the app, try:
   - Logging in with your admin email and password from Phase 11.
   - Generating a question.
   - Uploading a PDF.
4. If requests fail, run this from your **local machine** terminal to check if the server is reachable:
   ```bash
   curl -I http://54.123.45.67/docs
   ```
   Expected output: `HTTP/1.1 200 OK`

---

## ✅ PHASE 13 — Smoke Tests and Verification

```bash
# On the EC2 server — run these to confirm everything is healthy

# Check API is listening
curl -I http://127.0.0.1:8000/docs

# Check nginx is forwarding correctly (from outside)
curl -I http://<YOUR_EC2_PUBLIC_IP>/docs

# Check DB is reachable from inside the API
curl http://127.0.0.1:8000/health/db

# Check Docker containers are running
docker compose -f ~/PREPIFYAI/docker-compose.yml ps

# Check disk usage (stay below 90%)
df -h /

# Check memory (RAM + Swap)
free -h

# Check CPU load
top -b -n 1 | head -5
```

---

## ✅ PHASE 14 — Troubleshooting Cheat Sheet

### Problem: `pip install` kills the server (out-of-memory)
**Fix**: You forgot Phase 3. Run Phase 3 now, then retry `pip install`.

### Problem: `Connection refused` when curling the API
**Fix**:
```bash
sudo systemctl status prepifyai-api   # is it running?
sudo journalctl -u prepifyai-api -n 50  # read last 50 log lines for errors
```

### Problem: Postgres not healthy / migrations fail
**Fix**:
```bash
docker compose -f ~/PREPIFYAI/docker-compose.yml ps          # is postgres running?
docker compose -f ~/PREPIFYAI/docker-compose.yml logs postgres  # check DB logs
# Verify DATABASE_URL in app/.env matches the user/password in docker-compose.yml
cat ~/PREPIFYAI/app/.env | grep DATABASE_URL
cat ~/PREPIFYAI/docker-compose.yml | grep POSTGRES
```

### Problem: SSH connection refused / timeout
**Fix**: Check Security Group — your IP may have changed. In the AWS Console:
1. EC2 → Security Groups → `prepifyai-sg` → **Edit inbound rules**.
2. For the SSH (port 22) rule, change the source to **My IP** again.
3. Save rules.

### Problem: EC2 IP changed after restart
**Fix**: Attach an Elastic IP (see Step 12.1).

### Problem: Out of disk space
**Fix**:
```bash
df -h /                              # check disk usage
docker system prune -f               # remove unused docker images/volumes
sudo journalctl --vacuum-size=100M   # trim old system logs
```

### Problem: Port 80/443 not reachable from phone
**Fix**: Check Security Group has inbound rules for port 80 and 443 with source `0.0.0.0/0`.

---

## ✅ PHASE 15 — Daily Operational Checks

```bash
# Check everything is healthy (paste as one block)
sudo systemctl status prepifyai-api
docker compose -f ~/PREPIFYAI/docker-compose.yml ps
df -h /
free -h
```

Set a weekly calendar reminder to:
- Run `docker compose exec postgres pg_dump -U postgres PrepifyAI_Main > backup_$(date +%F).sql` and move it off the server.
- Check the AWS Free Tier usage dashboard.

---

## Reference: Key Variables Summary

| Variable | Where it goes | Example / Notes |
|---|---|---|
| EC2 Public IP | SSH command, React Native BASE_URL | `54.123.45.67` |
| EC2 Key file path (Mac) | `ssh -i ~/aws-keys/prepifyai-key.pem` | Keep it at `chmod 400` |
| EC2 Key file path (Windows) | `ssh -i "C:\Users\...\prepifyai-key.pem"` | Use PowerShell |
| `DATABASE_URL` | `app/.env` | Must match `docker-compose.yml` user/pass |
| `SECRET_KEY` | `app/.env` | Output of `openssl rand -hex 32` |
| `ADMIN_EMAIL` | `app/.env` | Your real email |
| `ADMIN_PASSWORD` | `app/.env` | Strong unique password |
| `TESSERACT_PATH` | `app/.env` | Always `/usr/bin/tesseract` on Ubuntu |
| Nginx site name | `/etc/nginx/sites-available/prepifyai` | Your domain or EC2 DNS |
