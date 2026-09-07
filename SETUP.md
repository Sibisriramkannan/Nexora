# Nexora Enterprise — Setup

Nexora is designed as a unified real-time observability, security, monitoring, incident and automation platform. The current repository contains the enterprise UI/backend foundation, Linux/Windows agents, persistent security scan scheduler, cloud/hybrid capability registry and authenticated telemetry ingestion APIs.

## 1. Prerequisites

Recommended:
- Docker Desktop / Docker Engine + Compose v2
- Git
- 8 GB RAM minimum (12–16 GB recommended for development)
- Ports 3000, 5432, 6379 and 8080 available

Native development also requires Node.js 18+; Go/.NET are only required if building the agents outside Docker.

## 2. Get the project

```bash
git clone <your-repository-url> nexora
cd nexora
```

Or extract the supplied ZIP and open the extracted `nexora` directory.

## 3. Configure secrets

```bash
cp .env.example .env
```

At minimum, replace `JWT_SECRET` with a long random value. Do not commit `.env`.

For email/Slack/Telegram/PagerDuty/Jira, add credentials only when those integrations are actually enabled.

## 4. Start the full development stack

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f backend
```

Open:
- UI: http://localhost:3000
- API: http://localhost:8080
- API health: http://localhost:8080/health

## 5. First login

The development database bootstrap creates:

- Email: `admin@nexora.com`
- Password: `Admin123!`

Immediately change/remove the default credentials before using Nexora outside local development.

## 6. Security scan scheduler

In the UI open **Security → Scan Scheduler**.

A schedule contains:
- Name
- Scan type: network/web/compliance/full
- Targets
- Cron expression
- Timezone
- Enabled/disabled state
- Scan profile/options

Example cron expressions:

```text
0 2 * * 0     # Sunday 02:00
0 */6 * * *   # every 6 hours
30 1 * * 1-5  # weekdays 01:30
```

Schedules are persisted in PostgreSQL and reloaded when the backend restarts. A due schedule creates a real Scan record and emits a WebSocket event; the scanner worker then owns execution.

## 7. Cloud & Hybrid

Open **Infrastructure → Cloud & Hybrid**.

The connector registry provides a stable provider abstraction for:
- AWS
- Azure
- GCP
- OCI
- Kubernetes
- Docker
- Linux/Windows/on-prem/SNMP/HTTP/TCP/DNS/ICMP

The registry is deliberately separate from the core resource model so additional providers/services can be added without rewriting the UI or telemetry pipeline.

## 8. Real-time telemetry API

Authenticated clients can send telemetry to:

```text
POST /api/telemetry/metrics
POST /api/telemetry/logs
POST /api/telemetry/traces
```

The backend publishes accepted events over Socket.IO as:

```text
telemetry:metric
telemetry:log
telemetry:trace
```

Use the existing agent APIs for host telemetry. The generic endpoints are intended for OpenTelemetry/exporter adapters and future cloud collectors.

## 9. Production deployment

Do not use the development Compose file directly for production. Start from:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Before production:
- Set unique database credentials.
- Set a strong JWT secret.
- Put the UI/API behind HTTPS.
- Configure TLS and secure cookies according to your ingress.
- Restrict PostgreSQL/Redis network exposure.
- Configure backups and restore testing.
- Configure SMTP/webhook credentials through a secrets manager.
- Disable or rotate the default admin credentials.
- Review RBAC and audit requirements.
- Load-test telemetry and scanner concurrency.

## 10. Native backend development

```bash
cd backend
npm ci
npm run dev
```

If the lockfile changes, commit the updated `package-lock.json`.

## 11. Frontend development

```bash
cd frontend
npm install
npm start
```

## 12. Agent builds

### Linux

```bash
cd agents/linux
go build -o nexora-agent agent.go
```

### Windows

```powershell
cd agents/windows
dotnet build NexoraAgent.csproj -c Release
```

## 13. Validation checklist

Before calling a deployment production-ready, validate:

- `GET /health`
- Login/token refresh
- PostgreSQL persistence
- Redis connectivity
- Agent registration + ownership checks
- Real metric ingestion
- WebSocket reconnect/authentication
- Scan creation/execution/failure handling
- Scheduler persistence/restart behavior
- Cloud credential isolation
- Alert grouping/deduplication/escalation
- Vulnerability scan authorization and rate limits
- Report generation
- Backup/restore
- HTTPS/TLS
- RBAC/audit trails

## Important implementation boundary

Nexora's architecture is prepared for multi-cloud and real-time expansion, but a provider capability entry is not a claim that every provider service has already been fully implemented and tested. Cloud connectors must be wired to the provider's authenticated APIs/SDKs and integration-tested before their data is shown as live. The UI must never fabricate cloud telemetry.

## Agent Enrollment & Installers

Nexora now supports one-time enrollment links for Linux and Windows agents. From the authenticated API, create an enrollment for a specific Server record, then use the returned installer URL or command. The enrollment token is single-use and expires automatically. The agent reports hostname, OS, private IP and interface inventory; Nexora records the observed source/public IP from the connection.

Public installer entry points are available under `/agent/linux/installer` and `/agent/windows/installer`. Without a token they prompt for one; generated enrollment URLs embed a single-use token.
