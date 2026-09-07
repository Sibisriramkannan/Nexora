# ============================================
# Nexora Agent Service Management Script
# ============================================

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status')]
    [string]$Action = 'status'
)

$ServiceName = "NexoraAgent"

function Start-AgentService {
    Write-Host "🚀 Starting Nexora Agent Service..." -ForegroundColor Cyan
    try {
        Start-Service -Name $ServiceName -ErrorAction Stop
        Write-Host "✅ Service started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start service: $_" -ForegroundColor Red
    }
}

function Stop-AgentService {
    Write-Host "🛑 Stopping Nexora Agent Service..." -ForegroundColor Cyan
    try {
        Stop-Service -Name $ServiceName -ErrorAction Stop
        Write-Host "✅ Service stopped successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to stop service: $_" -ForegroundColor Red
    }
}

function Restart-AgentService {
    Write-Host "🔄 Restarting Nexora Agent Service..." -ForegroundColor Cyan
    try {
        Restart-Service -Name $ServiceName -ErrorAction Stop
        Write-Host "✅ Service restarted successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to restart service: $_" -ForegroundColor Red
    }
}

function Get-AgentStatus {
    try {
        $service = Get-Service -Name $ServiceName -ErrorAction Stop
        Write-Host "📊 Nexora Agent Status:" -ForegroundColor Cyan
        Write-Host "  Name: $($service.Name)"
        Write-Host "  Status: $($service.Status)"
        Write-Host "  Start Type: $($service.StartType)"
        
        if ($service.Status -eq 'Running') {
            Write-Host "  ✅ Service is running" -ForegroundColor Green
        } elseif ($service.Status -eq 'Stopped') {
            Write-Host "  ❌ Service is stopped" -ForegroundColor Red
        } else {
            Write-Host "  ⚠️ Service is $($service.Status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Service not found: $_" -ForegroundColor Red
    }
}

function Show-Usage {
    Write-Host "Nexora Agent Service Management" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\agent-service.ps1 [ACTION]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Cyan
    Write-Host "  start    - Start the service"
    Write-Host "  stop     - Stop the service"
    Write-Host "  restart  - Restart the service"
    Write-Host "  status   - Show service status (default)"
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  .\agent-service.ps1 start"
}

# Main execution
switch ($Action.ToLower()) {
    'start' { Start-AgentService }
    'stop' { Stop-AgentService }
    'restart' { Restart-AgentService }
    'status' { Get-AgentStatus }
    default { Show-Usage }
}