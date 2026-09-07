# 🚀 Nexora

### **Next-Generation Observability & Security Platform**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/nexora)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-24.x-blue.svg)](https://docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Ready-orange.svg)](https://aws.amazon.com/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Agent Installation](#-agent-installation)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Monitoring & Maintenance](#-monitoring--maintenance)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Nexora** is an enterprise-grade, all-in-one observability and security platform that combines:

- 📊 **Real-time Infrastructure Monitoring** (Zabbix-style)
- 🔍 **Vulnerability Scanning** (Nessus-style)
- 🚨 **Intelligent Alerting** (Sensu-style)
- 📈 **Advanced Analytics & Reporting**
- 🔌 **Multi-channel Integrations** (Slack, Email, Telegram, PagerDuty, Jira)
- 🤖 **Cross-platform Agents** (Linux & Windows)
- 🎨 **Modern iOS-style UI** with Dark/Light mode

Built with a microservices architecture.

---

## ✨ Key Features

### 📊 Real-Time Dashboard

- **Live Metrics** - Real-time CPU, Memory, Disk, Network usage
- **Customizable Widgets** - Drag-and-drop dashboard builder
- **Global Server Map** - Visual server distribution across regions
- **Security Score** - AI-powered security posture assessment
- **Dark/Light Mode** - Eye-friendly interface for any environment

### 🖥️ Server & Site Monitoring

- **Agent-based Monitoring** - Lightweight agents for Linux & Windows
- **Agentless Monitoring** - HTTP, HTTPS, Ping, TCP, DNS checks
- **Auto-Discovery** - Automatically detects new servers and services
- **Template System** - Pre-configured monitoring templates
- **Service Dependencies** - Visual dependency mapping

### 🔍 Vulnerability Scanner

- **Network Scanning** - Port scanning, service detection, OS fingerprinting
- **Web Application Scanning** - SQLi, XSS, Path Traversal detection
- **CVE Database Integration** - Real-time vulnerability matching
- **Compliance Scanning** - PCI-DSS, HIPAA, GDPR, CIS benchmarks
- **Risk Scoring** - CVSS-based risk prioritization

### 🚨 Alerting System

- **Multi-channel Notifications** - Slack, Email, Telegram, PagerDuty, Jira
- **Escalation Policies** - Time-based alert escalation
- **Alert Suppression** - Deduplication, flapping detection
- **Maintenance Windows** - Scheduled alert silencing
- **Alert Templates** - Customizable notification formats

### 🔌 Integrations

- **Slack** - Interactive alert messages with buttons
- **Email (SMTP)** - HTML email alerts with attachments
- **Telegram** - Bot notifications with inline keyboards
- **PagerDuty** - Incident management integration
- **Jira** - Automatic issue creation
- **Discord** - Webhook notifications
- **Custom Webhooks** - Flexible HTTP callbacks

### 📁 Reports & Analytics

- **Multiple Formats** - PDF, Excel, CSV, HTML, JSON
- **Scheduled Reports** - Automated email delivery
- **Executive Summaries** - High-level overview dashboards
- **Compliance Reports** - Audit-ready compliance documentation

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          NEXORA PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐  │
│  │   Frontend  │     │   Backend   │     │      Database Layer     │  │
│  │   (React)   │────▶│  (Node.js)  │────▶│    PostgreSQL + Redis   │  │
│  │   :3000     │     │   :8080     │     │    InfluxDB (optional)  │  │
│  └─────────────┘     └─────────────┘     └─────────────────────────┘  │
│         │                    │                         │                │
│         │                    │                         │                │
│         ▼                    ▼                         ▼                │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐  │
│  │    Nginx    │     │  WebSocket  │     │      Agent Manager      │  │
│  │    Proxy    │     │   Server    │     │    (gRPC/REST/WS)       │  │
│  │   :80/443   │     │   Socket.io │     │                         │  │
│  └─────────────┘     └─────────────┘     └─────────────────────────┘  │
│                                                  │                     │
│                                                  ▼                     │
│                          ┌─────────────────────────────────────────┐  │
│                          │           Agents (Linux/Windows)        │  │
│                          │    Lightweight collectors on servers    │  │
│                          └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
````

### Component Breakdown

| Component            | Technology                              | Purpose                              |
| -------------------- | --------------------------------------- | ------------------------------------ |
| **Frontend**         | React 18 + Tailwind CSS + Framer Motion | User interface with iOS-style design |
| **Backend API**      | Node.js + Express                       | RESTful API endpoints                |
| **Real-time**        | Socket.io                               | WebSocket for live updates           |
| **Database**         | PostgreSQL                              | Primary data storage                 |
| **Cache**            | Redis                                   | Session management, queues, caching  |
| **Time-Series**      | InfluxDB (optional)                     | Metrics storage                      |
| **Proxy**            | Nginx                                   | Reverse proxy, SSL termination       |
| **Agents (Linux)**   | Go                                      | Lightweight metric collector         |
| **Agents (Windows)** | .NET Core                               | Lightweight metric collector         |
| **Scanner**          | Nmap + Custom Engine                    | Vulnerability detection              |
| **Container**        | Docker + Docker Compose                 | Container orchestration              |

---

## 🛠️ Technology Stack

### Backend

* **Runtime:** Node.js 18+
* **Framework:** Express.js 4.x
* **Database ORM:** Sequelize 6.x
* **Cache:** Redis 7.x (ioredis)
* **Time-Series:** InfluxDB 2.x (optional)
* **Real-time:** Socket.io 4.x
* **Authentication:** JWT + bcrypt
* **Validation:** Joi / express-validator
* **Logging:** Winston
* **Testing:** Jest

### Frontend

* **Framework:** React 18
* **State Management:** React Query + Context API
* **Routing:** React Router v6
* **Styling:** Tailwind CSS 3.x
* **Animations:** Framer Motion
* **Charts:** Recharts
* **UI Components:** Headless UI + Heroicons
* **Forms:** React Hook Form
* **HTTP Client:** Axios
* **Real-time:** Socket.io-client

### Infrastructure

* **Containerization:** Docker + Docker Compose
* **Web Server:** Nginx
* **Database:** PostgreSQL 15
* **Cache:** Redis 7
* **SSL:** Let's Encrypt / Certbot
* **Monitoring:** Prometheus + Grafana (optional)
* **CI/CD:** GitHub Actions (optional)

---

## 📸 Screenshots

### Dashboard Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│  🚀 NEXORA                                        🔍  👤 Admin      │
│  Next-Gen Observability Platform                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ 🟢 45    │ │ 🔴 3     │ │ 🔒 12    │ │ 🚨 23    │               │
│  │ Servers  │ │ Down     │ │ Vulns    │ │ Alerts   │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📈 UPTIME TREND                          Last 7 Days       │   │
│  │  ╭────────────────────────────────────────────────────────╮ │   │
│  │  │   99.8% ┼                    ╭──╮                    │ │   │
│  │  │   99.6% ┼              ╭──╮╭──╯  ╰──╮               │ │   │
│  │  │   99.4% ┼           ╭──╯  ╰╯       ╰──╮            │ │   │
│  │  │   99.2% ┼          ╭╯                 ╰──╮         │ │   │
│  │  │   99.0% ┼──────────╯─────────────────────╯         │ │   │
│  │  ╰────────────────────────────────────────────────────────╯ │   │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────┐ ┌──────────────────────────────────────┐   │
│  │ 🌍 SERVER MAP      │ │ 🛡️ SECURITY SCORE                    │   │
│  │  [World Map]       │ │   ┌──────────────────┐              │   │
│  │  🟢 20 USA         │ │   │  72/100          │              │   │
│  │  🟢 15 EU          │ │   │  🟡 Medium Risk  │              │   │
│  │  🔴 5 ASIA         │ │   └──────────────────┘              │   │
│  └────────────────────┘ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

* Docker & Docker Compose
* Node.js 18+ (for development)
* Git

### One-Click Deployment

```bash
# Clone the repository
git clone https://github.com/yourusername/nexora.git
cd nexora

# Copy environment variables
cp .env.example .env

# Edit configuration
nano .env

# Deploy with Docker
./scripts/deploy.sh

# Or manually
docker-compose -f docker-compose.prod.yml up -d --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Health Check: http://localhost:8080/health
```

---

## 📦 Installation

### Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/nexora.git
cd nexora

# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (in a new terminal)
cd ../frontend
npm install
npm start

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

### Production Environment (AWS)

```text
# See full AWS deployment guide below
# Step 1: Setup EC2 instance
# Step 2: Install Docker & dependencies
# Step 3: Clone and configure
# Step 4: Deploy with Docker Compose
# Step 5: Configure SSL with Let's Encrypt
# Step 6: Setup domain with Route53
```

---

## ⚙️ Configuration

### Environment Variables

```env
# ==================== SERVER ====================
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-domain.com
API_URL=https://your-domain.com
SERVER_NAME=Nexora

# ==================== DATABASE ====================
DB_HOST=postgres
DB_PORT=5432
DB_NAME=nexora
DB_USER=postgres
DB_PASSWORD=your_secure_password

# ==================== REDIS ====================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# ==================== JWT ====================
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ==================== EMAIL ====================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=alerts@your-domain.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Nexora <alerts@your-domain.com>

# ==================== SLACK ====================
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/yyy/zzz
SLACK_CHANNEL=#alerts

# ==================== TELEGRAM ====================
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# ==================== PAGERDUTY ====================
PAGERDUTY_SERVICE_KEY=your-service-key

# ==================== JIRA ====================
JIRA_URL=https://your-domain.atlassian.net
JIRA_PROJECT_KEY=PROJ
JIRA_USERNAME=admin@your-domain.com
JIRA_API_TOKEN=your-api-token

# ==================== SECURITY ====================
MFA_ENABLED=true
SESSION_TIMEOUT=86400
MAX_LOGIN_ATTEMPTS=5
```

### Configuration YAML

```yaml
system:
  name: Nexora
  environment: production
  timezone: Asia/Kolkata
  base_url: https://your-domain.com

monitoring:
  defaults:
    interval: 60
    timeout: 10
    retries: 3

  checks:
    http:
      enabled: true
      method: GET
      expected_status: 200

    ping:
      enabled: true
      packet_count: 4

alerting:
  rules:
    critical_http_down:
      severity: critical
      occurrences: 3
      actions: [pagerduty, slack, email]

    warning_http_slow:
      severity: warning
      condition: "response_time > 2000"
      actions: [slack, email]

scanner:
  enabled: true
  cve_sources:
    - nvd: "https://nvd.nist.gov/feeds/json/cve/1.1/"
    - exploitdb: "https://exploit-db.com/rss"
```

---

## 🚀 Deployment

### AWS EC2

#### Step 1: Launch EC2 Instance

```text
# AWS Console → EC2 → Launch Instance
# Name: nexora-main-server
# AMI: Ubuntu 22.04 LTS
# Instance Type: t3.medium (minimum)
# Storage: 30GB gp3
# Security Group: Configure with rules below
```

#### Step 2: Security Group

```text
Inbound Rules:
- SSH (22) - Your IP
- HTTP (80) - 0.0.0.0/0
- HTTPS (443) - 0.0.0.0/0
- Custom TCP (3000) - 0.0.0.0/0 (optional)
- Custom TCP (8080) - 0.0.0.0/0 (optional)
```

#### Step 3: Install Dependencies and Deploy

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/yourusername/nexora.git
cd nexora

# Configure environment
cp .env.example .env
nano .env

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps
```

#### Step 4: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Update nginx configuration
sudo nano nginx/nginx.conf

# Restart nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

#### Step 5: Route53

```text
# AWS Console → Route53 → Hosted Zones
# Create hosted zone for your domain

# Create A Record:
Name: your-domain.com
Type: A
Value: EC2 Public IP

# Create CNAME Record:
Name: www
Type: CNAME
Value: your-domain.com
```

---

## 🤖 Agent Installation

### Linux Agent

```bash
# One-liner installation
curl -sL https://your-domain.com/api/agents/linux/install.sh | \
    bash -s -- \
    --server-id=$(hostname) \
    --main-server=https://your-domain.com \
    --api-key=YOUR_API_KEY

# Check status
systemctl status nexora-agent

# View logs
journalctl -u nexora-agent -f

# Restart agent
systemctl restart nexora-agent

# Stop agent
systemctl stop nexora-agent
```

### Windows Agent

```powershell
# PowerShell (Run as Administrator)

# One-liner installation
$apiKey = "YOUR_API_KEY"
$mainServer = "https://your-domain.com"

Invoke-WebRequest -Uri "$mainServer/api/agents/windows/install.ps1" -OutFile "install.ps1"

.\install.ps1 -ApiKey $apiKey -MainServer $mainServer

# Check status
Get-Service -Name NexoraAgent

# View logs
Get-Content "$env:ProgramData\Nexora\Logs\agent.log" -Wait

# Restart agent
Restart-Service -Name NexoraAgent

# Stop agent
Stop-Service -Name NexoraAgent
```

---

## 📚 API Documentation

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| POST   | `/api/auth/logout`   | Logout user       |
| POST   | `/api/auth/refresh`  | Refresh token     |
| GET    | `/api/auth/me`       | Get current user  |

### Servers

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | `/api/servers`     | List all servers   |
| GET    | `/api/servers/:id` | Get server details |
| POST   | `/api/servers`     | Create server      |
| PUT    | `/api/servers/:id` | Update server      |
| DELETE | `/api/servers/:id` | Delete server      |

### Monitors

| Method | Endpoint                 | Description       |
| ------ | ------------------------ | ----------------- |
| GET    | `/api/monitors`          | List all monitors |
| POST   | `/api/monitors`          | Create monitor    |
| POST   | `/api/monitors/:id/test` | Test monitor      |
| DELETE | `/api/monitors/:id`      | Delete monitor    |

### Scanner

| Method | Endpoint                   | Description      |
| ------ | -------------------------- | ---------------- |
| GET    | `/api/scanner`             | List all scans   |
| POST   | `/api/scanner`             | Create scan      |
| POST   | `/api/scanner/:id/start`   | Start scan       |
| GET    | `/api/scanner/:id/results` | Get scan results |

### Alerts

| Method | Endpoint                      | Description          |
| ------ | ----------------------------- | -------------------- |
| GET    | `/api/alerts`                 | List all alerts      |
| GET    | `/api/alerts/stats`           | Get alert statistics |
| POST   | `/api/alerts/:id/acknowledge` | Acknowledge alert    |
| POST   | `/api/alerts/:id/resolve`     | Resolve alert        |

### Integrations

| Method | Endpoint                     | Description           |
| ------ | ---------------------------- | --------------------- |
| GET    | `/api/integrations`          | List all integrations |
| POST   | `/api/integrations`          | Create integration    |
| POST   | `/api/integrations/:id/test` | Test integration      |

### Agents

| Method | Endpoint                          | Description                |
| ------ | --------------------------------- | -------------------------- |
| POST   | `/api/agents/linux/register`      | Register Linux agent       |
| POST   | `/api/agents/linux/metrics`       | Receive Linux metrics      |
| GET    | `/api/agents/linux/install.sh`    | Get Linux install script   |
| POST   | `/api/agents/windows/register`    | Register Windows agent     |
| POST   | `/api/agents/windows/metrics`     | Receive Windows metrics    |
| GET    | `/api/agents/windows/install.ps1` | Get Windows install script |

### Reports

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| GET    | `/api/reports`              | List all reports |
| POST   | `/api/reports/generate`     | Generate report  |
| GET    | `/api/reports/:id/download` | Download report  |

---

## 🔒 Security

### Security Features

* **JWT Authentication** - Stateless token-based authentication
* **MFA Support** - Two-factor authentication with TOTP
* **Role-Based Access Control** - Admin, Manager, Engineer, Viewer, Auditor
* **Password Policy** - Enforce strong passwords
* **Session Management** - Configurable session timeout
* **Rate Limiting** - Prevent brute force attacks
* **CORS Protection** - Cross-origin resource sharing control
* **Helmet.js** - Secure HTTP headers
* **Input Validation** - Sanitize and validate all inputs
* **SQL Injection Protection** - Parameterized queries
* **XSS Protection** - Content Security Policy
* **CSRF Protection** - Cross-Site Request Forgery tokens

### Security Headers

```http
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self' https:
Referrer-Policy: no-referrer-when-downgrade
```

---

## 📈 Monitoring & Maintenance

### Backup

```bash
#!/bin/bash

BACKUP_DIR="/backups/nexora"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec -T postgres pg_dump -U postgres nexora > $BACKUP_DIR/db_$DATE.sql

# Backup configuration
cp .env $BACKUP_DIR/env_$DATE
cp config.yaml $BACKUP_DIR/config_$DATE

# Compress and upload to S3
gzip $BACKUP_DIR/*_$DATE
aws s3 sync $BACKUP_DIR s3://your-bucket/nexora-backups/

# Clean old backups
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check backend API
curl -s http://localhost:8080/health

# Check WebSocket
curl -s http://localhost:8080/ws
```

### Log Rotation

```bash
# Docker logs rotation
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
```

```yaml
# Application logs
# Configure log rotation in config.yaml

logging:
  max_size: "100MB"
  max_files: 30
  rotation: "daily"
```

---

## 🐛 Troubleshooting

### 1. Docker Containers Not Starting

```bash
docker-compose -f docker-compose.prod.yml logs --tail=50
df -h
sudo systemctl status docker
```

### 2. Database Connection Error

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres

echo $DB_HOST $DB_PORT $DB_NAME $DB_USER
```

### 3. Redis Connection Error

```bash
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

docker-compose -f docker-compose.prod.yml logs redis --tail=20
```

### 4. Agent Connection Error

```bash
# Linux
journalctl -u nexora-agent -f

# Windows
Get-Content "$env:ProgramData\Nexora\Logs\agent.log" -Wait

# Check API key
curl -H "X-API-Key: YOUR_API_KEY" https://your-domain.com/api/agents/health
```

### 5. SSL Issues

```bash
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

sudo certbot renew --dry-run

sudo certbot renew --force-renewal
```

### 6. Port Issues

```bash
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :8080
sudo lsof -i :3000
sudo lsof -i :5432
sudo lsof -i :6379

sudo kill -9 <PID>
```

### 7. Memory Issues

```bash
free -h
top
docker stats

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes:

```bash
git commit -m "Add amazing feature"
```

4. Push to the branch:

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request.

### Development Guidelines

* **Code Style:** ESLint + Prettier
* **Commit Messages:** Conventional Commits
* **Branch Naming:** `feature/`, `bugfix/`, `hotfix/`, `release/`
* **Testing:** Jest for backend, React Testing Library for frontend

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

* React Team
* Node.js Foundation
* Docker
* All Contributors

---

## 📞 Support

* **Documentation:** [https://nexora.your-domain.com/docs](https://nexora.your-domain.com/docs)
* **Issues:** [https://github.com/yourusername/nexora/issues](https://github.com/yourusername/nexora/issues)
* **Discord:** [https://discord.gg/nexora](https://discord.gg/nexora)
* **Email:** [support@nexora.com](mailto:support@nexora.com)

---

## 🏆 Project Status

| Component       | Status             |
| --------------- | ------------------ |
| Backend API     | ✅ Production Ready |
| Frontend UI     | ✅ Production Ready |
| Agent (Linux)   | ✅ Production Ready |
| Agent (Windows) | ✅ Production Ready |
| Scanner         | ✅ Production Ready |
| Alerting        | ✅ Production Ready |
| Integrations    | ✅ Production Ready |
| Reporting       | ✅ Production Ready |
| Documentation   | ✅ Complete         |
| Deployment      | ✅ Production Ready |

---

## 📊 Performance

| Metric              | Value          |
| ------------------- | -------------- |
| API Response Time   | < 50ms         |
| WebSocket Latency   | < 100ms        |
| Agent CPU Usage     | < 5%           |
| Agent Memory Usage  | < 50MB         |
| Dashboard Load Time | < 2s           |
| Scan Speed          | 1000 ports/sec |
| Alert Delivery      | < 5s           |
| Uptime              | 99.99%         |

---

## 🗺️ Roadmap

### Version 1.1

* [ ] Kubernetes deployment support
* [ ] Prometheus integration
* [ ] Grafana dashboards
* [ ] Advanced ML-based anomaly detection
* [ ] Mobile app (iOS/Android)

### Version 1.2

* [ ] Multi-tenancy
* [ ] SSO (Okta, Azure AD, Google)
* [ ] Webhook event subscriptions
* [ ] Custom dashboard builder
* [ ] API rate limiting per tenant

---

## ⚡ Quick Commands

```bash
# ==================== DEPLOYMENT ====================

./scripts/deploy.sh

docker-compose -f docker-compose.prod.yml up -d --build

docker-compose -f docker-compose.prod.yml down

docker-compose -f docker-compose.prod.yml logs -f

# ==================== BACKEND ====================

cd backend && npm install

npm run dev

npm start

npm test

# ==================== FRONTEND ====================

cd frontend && npm install

npm start

npm run build

# ==================== AGENTS ====================

# Linux
curl -sL https://your-domain.com/api/agents/linux/install.sh | bash -s -- --server-id=$(hostname) --api-key=YOUR_KEY

# Windows
powershell -Command "Invoke-WebRequest -Uri 'https://your-domain.com/api/agents/windows/install.ps1' -OutFile 'install.ps1'; .\install.ps1 -ApiKey YOUR_KEY"

# ==================== MAINTENANCE ====================

./backup.sh

docker system prune -af

sudo certbot renew
```

---

## 📜 MIT License

```text
MIT License

Copyright (c) 2024 Nexora

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

**🎉 Nexora - Complete Observability Platform**

**Made with ❤️ by the Nexora Team**

**🚀 Thank you for choosing Nexora!**

````

**This is the format you meant** — one outer ` ```markdown ` block, with the internal Bash/YAML/JSON/text blocks preserved.
````
