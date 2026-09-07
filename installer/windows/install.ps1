# Nexora one-command Windows installer. Requires Docker Desktop with Compose v2.
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $Root
function Fail($m){ Write-Error "[NEXORA] $m"; exit 1 }
function Secret([int]$bytes){
  $b = New-Object byte[] $bytes
  [Security.Cryptography.RandomNumberGenerator]::Fill($b)
  return [Convert]::ToBase64String($b).Replace('+','-').Replace('/','_').TrimEnd('=')
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Fail 'Docker Desktop is required.' }
docker compose version *> $null
if ($LASTEXITCODE -ne 0) { Fail 'Docker Compose v2 is required.' }
$envFile = Join-Path $Root '.env'
if (-not (Test-Path $envFile)) { Copy-Item (Join-Path $Root '.env.example') $envFile }
function Set-EnvValue($key,$value){
  $lines = @(Get-Content $envFile)
  $found = $false
  $lines = $lines | ForEach-Object { if ($_ -match "^$([regex]::Escape($key))=") { $found=$true; "$key=$value" } else { $_ } }
  if (-not $found) { $lines += "$key=$value" }
  Set-Content -Path $envFile -Value $lines -Encoding UTF8
}
$lines = @(Get-Content $envFile)
$jwt = (($lines | Where-Object { $_ -match '^JWT_SECRET=' }) -replace '^JWT_SECRET=','')
if ([string]::IsNullOrWhiteSpace($jwt) -or $jwt -match '^(your-|change-|replace-|dev-)') { Set-EnvValue 'JWT_SECRET' (Secret 64) }
$admin = (($lines | Where-Object { $_ -match '^NEXORA_ADMIN_PASSWORD=' }) -replace '^NEXORA_ADMIN_PASSWORD=','')
if ([string]::IsNullOrWhiteSpace($admin)) { $admin = Secret 24; Set-EnvValue 'NEXORA_ADMIN_PASSWORD' $admin }
Write-Host '[NEXORA] Building images and installing dependencies automatically...'
docker compose --env-file $envFile -f docker-compose.prod.yml up -d --build
Write-Host '[NEXORA] Waiting for backend health...'
for ($i=0; $i -lt 60; $i++) {
  try { Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8080/health -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Seconds 2 }
}
try { Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8080/health -TimeoutSec 5 | Out-Null } catch { docker compose -f docker-compose.prod.yml logs --tail=200 backend; Fail 'Nexora did not become healthy.' }
Write-Host "[NEXORA] Installation completed successfully. Admin: admin@nexora.com"
Write-Host "[NEXORA] Initial password: $admin"
