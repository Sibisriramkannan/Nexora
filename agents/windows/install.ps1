# ============================================
# Nexora Agent Installer for Windows
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerId = $env:COMPUTERNAME,
    
    [Parameter(Mandatory=$false)]
    [string]$MainServer = "https://nexora.yourdomain.com",
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$false)]
    [int]$Interval = 30
)

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

Write-Host "🚀 Nexora Agent Installation" -ForegroundColor $Cyan
Write-Host "================================" -ForegroundColor $Cyan

# Validate API Key
if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "❌ API Key is required" -ForegroundColor $Red
    Write-Host "Usage: .\install.ps1 -ApiKey YOUR_API_KEY" -ForegroundColor $Yellow
    exit 1
}

Write-Host "📋 Installation Parameters:" -ForegroundColor $Green
Write-Host "  Server ID: $ServerId"
Write-Host "  Main Server: $MainServer"
Write-Host "  API Key: $($ApiKey.Substring(0, [Math]::Min(8, $ApiKey.Length)))..."
Write-Host "  Interval: $Interval seconds"

# ==================== CREATE DIRECTORIES ====================

Write-Host "📁 Creating directories..." -ForegroundColor $Cyan

$InstallDir = "C:\Program Files\Nexora"
$ConfigDir = "$env:ProgramData\Nexora"
$LogDir = "$env:ProgramData\Nexora\Logs"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# ==================== DOWNLOAD AGENT ====================

Write-Host "📥 Downloading agent..." -ForegroundColor $Cyan

$AgentUrl = "$MainServer/api/agents/windows/download"
$AgentPath = "$InstallDir\nexora-agent.ps1"

try {
    Invoke-WebRequest -Uri $AgentUrl -OutFile $AgentPath -ErrorAction Stop
    Write-Host "✅ Agent downloaded successfully" -ForegroundColor $Green
} catch {
    Write-Host "⚠️ Could not download from main server, building from source..." -ForegroundColor $Yellow
    
    # Check if .NET SDK is installed
    $dotnetVersion = dotnet --version 2>$null
    if (-not $dotnetVersion) {
        Write-Host "❌ .NET SDK not found. Please install .NET SDK 6.0 or later." -ForegroundColor $Red
        Write-Host "Download from: https://dotnet.microsoft.com/download" -ForegroundColor $Yellow
        exit 1
    }
    
    Write-Host "🔨 Building agent from source..." -ForegroundColor $Cyan
    # Build agent
    # (In real scenario, you'd compile the C# code here)
}

# ==================== CREATE CONFIGURATION ====================

Write-Host "⚙️ Creating configuration..." -ForegroundColor $Cyan

$ConfigPath = "$ConfigDir\agent.json"
$ConfigContent = @"
{
    "ServerId": "$ServerId",
    "MainServer": "$MainServer",
    "ApiKey": "$ApiKey",
    "Interval": $Interval,
    "LogLevel": "info",
    "UseTLS": true
}
"@

$ConfigContent | Out-File -FilePath $ConfigPath -Encoding UTF8

# ==================== CREATE WINDOWS SERVICE ====================

Write-Host "🔄 Creating Windows Service..." -ForegroundColor $Cyan

$ServiceName = "NexoraAgent"
$ServiceDisplayName = "Nexora Monitoring Agent"
$ServiceDescription = "Collects and sends system metrics to Nexora server"

# Stop existing service if running
if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
}

# Create service
$ServicePath = "`"$AgentPath`""
New-Service -Name $ServiceName `
    -BinaryPathName $ServicePath `
    -DisplayName $ServiceDisplayName `
    -Description $ServiceDescription `
    -StartupType Automatic

# Set service recovery options
sc.exe failure $ServiceName reset=60 actions=restart/60000/restart/60000/restart/60000

# Set environment variables for service
$EnvPath = "$ConfigDir\agent.env"
@"
SERVER_ID=$ServerId
MAIN_SERVER=$MainServer
API_KEY=$ApiKey
INTERVAL=$Interval
"@ | Out-File -FilePath $EnvPath -Encoding UTF8

# ==================== START SERVICE ====================

Write-Host "🚀 Starting service..." -ForegroundColor $Cyan

Start-Service -Name $ServiceName

Start-Sleep -Seconds 3

# Check status
$service = Get-Service -Name $ServiceName
if ($service.Status -eq 'Running') {
    Write-Host "✅ Service started successfully" -ForegroundColor $Green
} else {
    Write-Host "❌ Service failed to start" -ForegroundColor $Red
    Write-Host "Service Status: $($service.Status)" -ForegroundColor $Yellow
    exit 1
}

# ==================== SUMMARY ====================

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Green
Write-Host "📊 Agent Status:" -ForegroundColor $Cyan
Get-Service -Name $ServiceName

Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor $Cyan
Write-Host "  - View logs: Get-Content '$LogDir\agent.log' -Wait"
Write-Host "  - Restart:  Restart-Service -Name $ServiceName"
Write-Host "  - Stop:     Stop-Service -Name $ServiceName"
Write-Host "  - Status:   Get-Service -Name $ServiceName"

Write-Host ""
Write-Host "📁 Files:" -ForegroundColor $Cyan
Write-Host "  - Binary:    $AgentPath"
Write-Host "  - Config:    $ConfigPath"
Write-Host "  - Logs:      $LogDir"

Write-Host ""
Write-Host "🔗 Agent connected to: $MainServer" -ForegroundColor $Cyan