$ErrorActionPreference='Stop'
$MainServer='__NEXORA_URL__'
$Token='__TOKEN__'
if ([string]::IsNullOrWhiteSpace($Token)) { $Token=Read-Host 'Nexora enrollment token' }
$Root="$env:ProgramData\Nexora-Agent"
New-Item -ItemType Directory -Force -Path $Root | Out-Null
$hostname=$env:COMPUTERNAME
$private=(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {$_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*'} | Select-Object -First 1 -ExpandProperty IPAddress)
$body=@{server_id=$hostname;hostname=$hostname;os='Windows';os_version=(Get-CimInstance Win32_OperatingSystem).Caption;private_ip=$private;architecture='x64';version='1.0.0'} | ConvertTo-Json
$r=Invoke-RestMethod -Method Post -Uri "$MainServer/api/agent-enrollment/register/$Token" -ContentType 'application/json' -Body $body
$envFile="$Root\agent.env"
"NEXORA_URL=$MainServer`nNEXORA_API_KEY=$($r.data.api_key)`nNEXORA_SERVER_ID=$($r.data.server_id)" | Set-Content $envFile -Encoding utf8
$agent="$Root\agent.ps1"
@'
$ErrorActionPreference='SilentlyContinue'
$envFile="$env:ProgramData\Nexora-Agent\agent.env"
while (Test-Path $envFile) {
  $cfg=@{}; Get-Content $envFile | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') {$cfg[$matches[1]]=$matches[2]} }
  $cpu=(Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
  $os=Get-CimInstance Win32_OperatingSystem
  $mem=(($os.TotalVisibleMemorySize-$os.FreePhysicalMemory)/$os.TotalVisibleMemorySize)*100
  $disk=Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
  $diskPct=(($disk.Size-$disk.FreeSpace)/$disk.Size)*100
  $body=@{cpu=[math]::Round($cpu,2);memory=[math]::Round($mem,2);disk=[math]::Round($diskPct,2);uptime=[math]::Round(([Environment]::TickCount64/1000),0);timestamp=[DateTimeOffset]::UtcNow.ToUnixTimeSeconds()} | ConvertTo-Json
  try { Invoke-RestMethod -Method Post -Uri "$($cfg.NEXORA_URL)/api/agents/windows/metrics" -Headers @{'X-API-Key'=$cfg.NEXORA_API_KEY;'X-Server-ID'=$cfg.NEXORA_SERVER_ID} -ContentType 'application/json' -Body $body | Out-Null } catch {}
  Start-Sleep -Seconds 30
}
'@ | Set-Content $agent -Encoding utf8
$action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$agent`""
$trigger=New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName 'NexoraAgent' -Action $action -Trigger $trigger -RunLevel Highest -Force | Out-Null
Start-ScheduledTask -TaskName 'NexoraAgent'
Write-Host 'NEXORA_AGENT_CONNECTED'
Write-Host "Server: $($r.data.server_name)"
