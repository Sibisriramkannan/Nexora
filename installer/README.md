# Nexora Installers

Nexora is designed for zero-manual dependency installation.

## Linux

From the extracted repository:

```bash
./installer/linux/install.sh
```

The installer uses Docker Compose, generates runtime secrets when missing, builds both application images, installs Node dependencies inside the images, initializes PostgreSQL/Redis, waits for `/health`, and prints the initial admin password.

## Windows

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\installer\windows\install.ps1
```

Docker Desktop + Compose v2 must be installed.

## Cloud CI/CD

Railway/Render/VPS Docker deployments install dependencies during image build. Never commit `node_modules` or `.env`. Backend uses `npm ci --omit=dev` from the committed lockfile.
