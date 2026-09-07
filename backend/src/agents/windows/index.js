const express = require('express');
const router = express.Router();
const agentManager = require('../agentManager');
const logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid');

// ==================== GENERATE API KEY ====================
function generateApiKey() {
    return 'nexora_' + uuidv4().replace(/-/g, '');
}

// ==================== INSTALLATION SCRIPT ====================
function generateInstallPS1(apiKey, mainServer, serverId) {
    const now = new Date().toISOString();
    
    let script = '# Nexora Windows Agent Installation Script\n';
    script += '# Generated: ' + now + '\n\n';
    script += 'param(\n';
    script += '    [string]$ServerId = "' + serverId + '",\n';
    script += '    [string]$MainServer = "' + mainServer + '",\n';
    script += '    [string]$ApiKey = "' + apiKey + '",\n';
    script += '    [int]$Interval = 30\n';
    script += ')\n\n';
    script += 'Write-Host "🚀 Installing Nexora Windows Agent..." -ForegroundColor Cyan\n';
    script += 'Write-Host "=====================================" -ForegroundColor Cyan\n\n';
    script += '# Check if running as Administrator\n';
    script += '$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")\n';
    script += 'if (-not $isAdmin) {\n';
    script += '    Write-Host "❌ Please run as Administrator" -ForegroundColor Red\n';
    script += '    exit 1\n';
    script += '}\n\n';
    script += '# Create directories\n';
    script += 'Write-Host "📁 Creating directories..." -ForegroundColor Cyan\n';
    script += '$InstallDir = "C:\\Program Files\\Nexora"\n';
    script += '$ConfigDir = "$env:ProgramData\\Nexora"\n';
    script += '$LogDir = "$env:ProgramData\\Nexora\\Logs"\n\n';
    script += 'New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null\n';
    script += 'New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null\n';
    script += 'New-Item -ItemType Directory -Force -Path $LogDir | Out-Null\n\n';
    script += '# Download agent\n';
    script += 'Write-Host "📥 Downloading agent..." -ForegroundColor Cyan\n';
    script += '$AgentUrl = "$MainServer/api/agents/windows/download"\n';
    script += '$AgentPath = "$InstallDir\\nexora-agent.ps1"\n\n';
    script += 'try {\n';
    script += '    Invoke-WebRequest -Uri $AgentUrl -OutFile $AgentPath -ErrorAction Stop\n';
    script += '    Write-Host "✅ Agent downloaded successfully" -ForegroundColor Green\n';
    script += '} catch {\n';
    script += '    Write-Host "⚠️ Creating placeholder agent..." -ForegroundColor Yellow\n';
    script += '    $script = @"\n';
    script += '# Nexora Agent - Windows\n';
    script += '# Server ID: ' + serverId + '\n';
    script += '# Main Server: ' + mainServer + '\n\n';
    script += 'while (true) {\n';
    script += '    $CPU = (Get-Counter "\\Processor(_Total)\\% Processor Time").CounterSamples.CookedValue\n';
    script += '    $Memory = (Get-Counter "\\Memory\\% Committed Bytes In Use").CounterSamples.CookedValue\n';
    script += '    $Disk = (Get-Counter "\\LogicalDisk(C:)\\% Free Space").CounterSamples.CookedValue\n';
    script += '    $Processes = (Get-Process).Count\n';
    script += '    $Uptime = [Environment]::TickCount / 1000\n\n';
    script += '    $body = @{\n';
    script += '        cpu = $CPU\n';
    script += '        memory = $Memory\n';
    script += '        disk = 100 - $Disk\n';
    script += '        process_count = $Processes\n';
    script += '        uptime = $Uptime\n';
    script += '        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()\n';
    script += '    } | ConvertTo-Json\n\n';
    script += '    try {\n';
    script += '        Invoke-RestMethod -Uri "' + mainServer + '/api/agents/windows/metrics" `\n';
    script += '            -Method Post `\n';
    script += '            -Body $body `\n';
    script += '            -ContentType "application/json" `\n';
    script += '            -Headers @{\n';
    script += '                "X-API-Key" = "' + apiKey + '"\n';
    script += '                "X-Server-ID" = "' + serverId + '"\n';
    script += '            } -ErrorAction SilentlyContinue\n\n';
    script += '        Write-Host "✅ Sent metrics: CPU=$CPU% MEM=$Memory% DISK=$(100-$Disk)%"\n';
    script += '    } catch {\n';
    script += '        Write-Host "❌ Failed to send metrics: $($_.Exception.Message)" -ForegroundColor Red\n';
    script += '    }\n\n';
    script += '    Start-Sleep -Seconds $Interval\n';
    script += '}\n';
    script += '"@\n';
    script += '    $script | Out-File -FilePath $AgentPath -Encoding UTF8\n';
    script += '}\n\n';
    script += '# Create config\n';
    script += 'Write-Host "⚙️ Creating configuration..." -ForegroundColor Cyan\n';
    script += '$ConfigPath = "$ConfigDir\\agent.json"\n';
    script += '$ConfigContent = @"\n';
    script += '{\n';
    script += '    "ServerId": "' + serverId + '",\n';
    script += '    "MainServer": "' + mainServer + '",\n';
    script += '    "ApiKey": "' + apiKey + '",\n';
    script += '    "Interval": 30,\n';
    script += '    "LogLevel": "info"\n';
    script += '}\n';
    script += '"@\n';
    script += '$ConfigContent | Out-File -FilePath $ConfigPath -Encoding UTF8\n\n';
    script += '# Create Windows Service\n';
    script += 'Write-Host "🔄 Creating Windows Service..." -ForegroundColor Cyan\n';
    script += '$ServiceName = "NexoraAgent"\n';
    script += '$ServiceDisplayName = "Nexora Monitoring Agent"\n';
    script += '$ServiceDescription = "Collects and sends system metrics to Nexora server"\n\n';
    script += 'if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {\n';
    script += '    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue\n';
    script += '    sc.exe delete $ServiceName | Out-Null\n';
    script += '    Start-Sleep -Seconds 2\n';
    script += '}\n\n';
    script += 'New-Service -Name $ServiceName `\n';
    script += '    -BinaryPathName "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$AgentPath`"" `\n';
    script += '    -DisplayName $ServiceDisplayName `\n';
    script += '    -Description $ServiceDescription `\n';
    script += '    -StartupType Automatic\n\n';
    script += 'sc.exe failure $ServiceName reset=60 actions=restart/60000/restart/60000/restart/60000\n\n';
    script += 'Write-Host "🚀 Starting service..." -ForegroundColor Cyan\n';
    script += 'Start-Service -Name $ServiceName\n\n';
    script += 'Start-Sleep -Seconds 3\n\n';
    script += '$service = Get-Service -Name $ServiceName\n';
    script += 'if ($service.Status -eq "Running") {\n';
    script += '    Write-Host "✅ Service started successfully" -ForegroundColor Green\n';
    script += '} else {\n';
    script += '    Write-Host "❌ Service failed to start" -ForegroundColor Red\n';
    script += '    exit 1\n';
    script += '}\n\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "✅ Agent installed successfully!" -ForegroundColor Green\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "📊 Status:" -ForegroundColor Cyan\n';
    script += 'Get-Service -Name $ServiceName\n\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "📋 Commands:" -ForegroundColor Cyan\n';
    script += 'Write-Host "  - View logs: Get-Content `"$LogDir\\agent.log`" -Wait"\n';
    script += 'Write-Host "  - Restart: Restart-Service -Name $ServiceName"\n';
    script += 'Write-Host "  - Stop: Stop-Service -Name $ServiceName"\n';
    script += 'Write-Host "  - Status: Get-Service -Name $ServiceName"\n';

    return script;
}

// ==================== GENERATE WINDOWS INSTALL SCRIPT ====================
function generateWindowsInstallScript(config) {
    let script = '# Nexora Windows Agent Installation Script\n\n';
    script += 'param(\n';
    script += '    [string]$ServerId = "' + config.server_id + '",\n';
    script += '    [string]$MainServer = "' + config.main_server + '",\n';
    script += '    [string]$ApiKey = "' + config.api_key + '",\n';
    script += '    [int]$Interval = ' + config.interval + '\n';
    script += ')\n\n';
    script += 'Write-Host "🚀 Installing Nexora Windows Agent..."\n';
    script += 'Write-Host "====================================="\n\n';
    script += '$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")\n';
    script += 'if (-not $isAdmin) {\n';
    script += '    Write-Host "❌ Please run as Administrator"\n';
    script += '    exit 1\n';
    script += '}\n\n';
    script += '$InstallDir = "C:\\Program Files\\Nexora"\n';
    script += '$ConfigDir = "$env:ProgramData\\Nexora"\n';
    script += '$LogDir = "$env:ProgramData\\Nexora\\Logs"\n\n';
    script += 'New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null\n';
    script += 'New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null\n';
    script += 'New-Item -ItemType Directory -Force -Path $LogDir | Out-Null\n\n';
    script += '$AgentUrl = "$MainServer/api/agents/windows/download"\n';
    script += '$AgentPath = "$InstallDir\\nexora-agent.ps1"\n\n';
    script += 'Invoke-WebRequest -Uri $AgentUrl -OutFile $AgentPath\n\n';
    script += '$ConfigPath = "$ConfigDir\\agent.json"\n';
    script += '$ConfigContent = @"\n';
    script += '{\n';
    script += '    "ServerId": "' + config.server_id + '",\n';
    script += '    "MainServer": "' + config.main_server + '",\n';
    script += '    "ApiKey": "' + config.api_key + '",\n';
    script += '    "Interval": ' + config.interval + ',\n';
    script += '    "LogLevel": "info"\n';
    script += '}\n';
    script += '"@\n';
    script += '$ConfigContent | Out-File -FilePath $ConfigPath -Encoding UTF8\n\n';
    script += '$ServiceName = "NexoraAgent"\n';
    script += 'New-Service -Name $ServiceName `\n';
    script += '    -BinaryPathName "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$AgentPath`"" `\n';
    script += '    -DisplayName "Nexora Monitoring Agent" `\n';
    script += '    -StartupType Automatic\n\n';
    script += 'Start-Service -Name $ServiceName\n\n';
    script += 'Write-Host "✅ Agent installed successfully!"\n';

    return script;
}

// ==================== GENERATE AGENT BINARY ====================
function generateAgentBinaryPS1() {
    let script = '# Nexora Agent Binary\n\n';
    script += 'param(\n';
    script += '    [string]$ConfigPath = "$env:ProgramData\\Nexora\\agent.json"\n';
    script += ')\n\n';
    script += 'if (Test-Path $ConfigPath) {\n';
    script += '    $config = Get-Content $ConfigPath | ConvertFrom-Json\n';
    script += '    $ServerId = $config.ServerId\n';
    script += '    $MainServer = $config.MainServer\n';
    script += '    $ApiKey = $config.ApiKey\n';
    script += '    $Interval = $config.Interval\n';
    script += '}\n\n';
    script += '$ServerId = if ($ServerId) { $ServerId } else { $env:COMPUTERNAME }\n';
    script += '$MainServer = if ($MainServer) { $MainServer } else { "https://nexora.yourdomain.com" }\n';
    script += '$ApiKey = if ($ApiKey) { $ApiKey } else { $env:API_KEY }\n';
    script += '$Interval = if ($Interval) { $Interval } else { 30 }\n\n';
    script += 'if (-not $ApiKey) {\n';
    script += '    Write-Host "❌ API_KEY is required"\n';
    script += '    exit 1\n';
    script += '}\n\n';
    script += 'Write-Host "🚀 Nexora Windows Agent"\n';
    script += 'Write-Host "📡 Server ID: $ServerId"\n';
    script += 'Write-Host "🌐 Main Server: $MainServer"\n';
    script += 'Write-Host "⏱️ Interval: $Interval seconds"\n';
    script += 'Write-Host "====================================="\n\n';
    script += 'while ($true) {\n';
    script += '    try {\n';
    script += '        $CPU = (Get-Counter "\\Processor(_Total)\\% Processor Time" -ErrorAction SilentlyContinue).CounterSamples.CookedValue\n';
    script += '        $Memory = (Get-Counter "\\Memory\\Available MBytes" -ErrorAction SilentlyContinue).CounterSamples.CookedValue\n';
    script += '        $TotalMemory = (Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1MB\n';
    script += '        $MemoryPercent = (($TotalMemory - $Memory) / $TotalMemory) * 100\n';
    script += '        $Disk = (Get-CimInstance Win32_LogicalDisk -Filter "DeviceID=\'C:\'").FreeSpace\n';
    script += '        $TotalDisk = (Get-CimInstance Win32_LogicalDisk -Filter "DeviceID=\'C:\'").Size\n';
    script += '        $DiskPercent = (($TotalDisk - $Disk) / $TotalDisk) * 100\n';
    script += '        $Processes = (Get-Process).Count\n';
    script += '        $Uptime = [Environment]::TickCount / 1000\n\n';
    script += '        $metrics = @{\n';
    script += '            cpu = [Math]::Round($CPU, 2)\n';
    script += '            memory = [Math]::Round($MemoryPercent, 2)\n';
    script += '            disk = [Math]::Round($DiskPercent, 2)\n';
    script += '            process_count = $Processes\n';
    script += '            uptime = [Math]::Round($Uptime, 0)\n';
    script += '            timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()\n';
    script += '        }\n\n';
    script += '        $body = $metrics | ConvertTo-Json\n';
    script += '        $headers = @{\n';
    script += '            "X-API-Key" = $ApiKey\n';
    script += '            "X-Server-ID" = $ServerId\n';
    script += '        }\n\n';
    script += '        Invoke-RestMethod -Uri "$MainServer/api/agents/windows/metrics" `\n';
    script += '            -Method Post `\n';
    script += '            -Body $body `\n';
    script += '            -ContentType "application/json" `\n';
    script += '            -Headers $headers `\n';
    script += '            -ErrorAction Stop\n\n';
    script += '        Write-Host "✅ Sent metrics: CPU=$($metrics.cpu)% MEM=$($metrics.memory)% DISK=$($metrics.disk)%"\n';
    script += '    } catch {\n';
    script += '        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red\n';
    script += '    }\n\n';
    script += '    Start-Sleep -Seconds $Interval\n';
    script += '}\n';

    return script;
}

// ==================== ROUTES ====================

// Register agent
router.post('/register', async (req, res) => {
    try {
        const { server_id, hostname, os, os_version, ip, version } = req.body;

        if (!server_id) {
            return res.status(400).json({
                success: false,
                message: 'server_id is required'
            });
        }

        const server = await agentManager.registerAgent({
            server_id: server_id,
            hostname: hostname || server_id,
            os: os || 'Windows',
            os_version: os_version || 'Unknown',
            ip: ip || req.ip || 'unknown',
            version: version || '1.0.0'
        });

        const config = {
            server_id: server_id,
            main_server: req.protocol + '://' + req.get('host'),
            api_key: server.api_key || generateApiKey(),
            interval: 30,
            log_level: 'info'
        };

        const installScript = generateWindowsInstallScript(config);

        res.status(200).json({
            success: true,
            message: 'Agent registered successfully',
            data: {
                server_id: server_id,
                config: config,
                install_script: installScript,
                install_command: 'powershell -Command "Invoke-WebRequest -Uri \'' + req.protocol + '://' + req.get('host') + '/api/agents/windows/install.ps1\' -OutFile \'install.ps1\'; .\\install.ps1 -ApiKey \'' + config.api_key + '\'"',
                install_ps1: req.protocol + '://' + req.get('host') + '/api/agents/windows/install.ps1'
            }
        });
    } catch (error) {
        logger.error('Windows agent registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register agent',
            error: error.message
        });
    }
});

// Receive metrics
router.post('/metrics', async (req, res) => {
    try {
        const metrics = req.body;
        const apiKey = req.headers['x-api-key'];
        const serverId = req.headers['x-server-id'];

        if (!apiKey || !serverId) {
            return res.status(401).json({
                success: false,
                message: 'API key and server ID required'
            });
        }

        const isValid = await agentManager.validateApiKey(serverId, apiKey);
        if (!isValid) {
            return res.status(403).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        if (metrics.cpu === undefined || metrics.cpu === null || metrics.memory === undefined || metrics.memory === null || metrics.disk === undefined || metrics.disk === null) {
            return res.status(400).json({
                success: false,
                message: 'Incomplete metrics data'
            });
        }

        await agentManager.processMetrics({
            ...metrics,
            server_id: serverId,
            timestamp: metrics.timestamp || Math.floor(Date.now() / 1000)
        });

        res.status(200).json({
            success: true,
            message: 'Metrics received',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Windows metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process metrics',
            error: error.message
        });
    }
});

// Get agent status
router.get('/status/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const status = agentManager.getAgentStatus(serverId);

        if (!status) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        logger.error('Agent status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get agent status',
            error: error.message
        });
    }
});

// Get all agents
router.get('/agents', async (req, res) => {
    try {
        const agents = agentManager.getAllAgents();
        res.json({
            success: true,
            data: agents,
            count: agents.length
        });
    } catch (error) {
        logger.error('Get agents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get agents',
            error: error.message
        });
    }
});

// Get installation script
router.get('/install.ps1', (req, res) => {
    try {
        const apiKey = req.query.api_key;
        const mainServer = req.query.main_server || req.protocol + '://' + req.get('host');
        const serverId = req.query.server_id || 'auto';

        const script = generateInstallPS1(apiKey, mainServer, serverId);

        res.setHeader('Content-Type', 'text/plain');
        res.send(script);
    } catch (error) {
        logger.error('Install script error:', error);
        res.status(500).send('Failed to generate install script');
    }
});

// Download agent binary
router.get('/download', (req, res) => {
    try {
        const binary = generateAgentBinaryPS1();

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=nexora-agent.ps1');
        res.send(binary);
    } catch (error) {
        logger.error('Agent download error:', error);
        res.status(500).send('Failed to download agent');
    }
});

module.exports = router;