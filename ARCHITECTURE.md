# Nexora Architecture Contract

## Core planes

1. **Experience plane** — React UI, dashboards, explorer, incidents, security and administration.
2. **API plane** — authenticated REST + Socket.IO.
3. **Collection plane** — Linux/Windows agents, HTTP/TCP/DNS/ICMP, cloud adapters, Kubernetes/Docker and OpenTelemetry adapters.
4. **Processing plane** — metric normalization, alert evaluation, correlation, scanner workers, scheduler and automation.
5. **Data plane** — PostgreSQL for control/configuration and a dedicated time-series/log/trace store as scale requires; Redis for ephemeral state/queues.
6. **Security plane** — RBAC, audit, secrets, vulnerability/CVE/compliance workflows.

## Universal resource model

Every provider adapter should normalize resources to:

`provider → account/tenant → region/zone → resource_type → resource_id → status → dependencies → metrics/logs/traces/events → security posture`

This is the compatibility contract that allows AWS/Azure/GCP/OCI/on-prem resources to appear in the same Nexora views.

## Real-time contract

Collectors may push events or be polled. All normalized telemetry must carry a source, timestamp, resource identity and schema/version. Socket.IO is used for browser delivery; durable telemetry storage should be selected independently of the UI transport.

## No-fake-data rule

A widget may display `No data`/`Not configured` rather than inventing telemetry. Provider adapters must expose their implementation state and health separately from the resource data.

## Agent Enrollment Contract

Agent onboarding is token-based rather than distributing permanent API keys. An authenticated administrator creates an enrollment bound to a Server, OS and architecture. The generated URL contains a short-lived, single-use enrollment token. The target agent submits its host identity and network inventory over HTTPS, the server consumes the token, creates/rotates the agent credential, and emits `agent:connected` over the authenticated WebSocket channel. Public IP is treated as an observed connection attribute; agent-reported public IP is informational.
