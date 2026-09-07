package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "os"
    "os/signal"
    "runtime"
    "syscall"
    "time"

    "github.com/shirou/gopsutil/v3/cpu"
    "github.com/shirou/gopsutil/v3/disk"
    "github.com/shirou/gopsutil/v3/host"
    "github.com/shirou/gopsutil/v3/mem"
    "github.com/shirou/gopsutil/v3/net"
    "github.com/shirou/gopsutil/v3/process"
    "gopkg.in/yaml.v3"
)

// ==================== CONFIGURATION ====================

type Config struct {
    ServerID   string `yaml:"server_id"`
    MainServer string `yaml:"main_server"`
    APIKey     string `yaml:"api_key"`
    Interval   int    `yaml:"interval"`
    LogLevel   string `yaml:"log_level"`
    TLS        struct {
        Enabled  bool   `yaml:"enabled"`
        CertFile string `yaml:"cert_file"`
        KeyFile  string `yaml:"key_file"`
    } `yaml:"tls"`
}

type Agent struct {
    Config     Config
    HTTPClient *http.Client
    StopChan   chan struct{}
}

// ==================== METRICS STRUCTURES ====================

type Metrics struct {
    ServerID      string                 `json:"server_id"`
    Timestamp     int64                  `json:"timestamp"`
    CPU           float64                `json:"cpu"`
    Memory        float64                `json:"memory"`
    Disk          float64                `json:"disk"`
    LoadAvg       []float64              `json:"load_avg"`
    ProcessCount  int32                  `json:"process_count"`
    Network       []NetworkStats         `json:"network"`
    OS            string                 `json:"os"`
    OSVersion     string                 `json:"os_version"`
    Hostname      string                 `json:"hostname"`
    Uptime        uint64                 `json:"uptime"`
    CustomMetrics map[string]interface{} `json:"custom_metrics"`
}

type NetworkStats struct {
    Name        string `json:"name"`
    BytesSent   uint64 `json:"bytes_sent"`
    BytesRecv   uint64 `json:"bytes_recv"`
    PacketsSent uint64 `json:"packets_sent"`
    PacketsRecv uint64 `json:"packets_recv"`
}

type RegisterData struct {
    ServerID  string `json:"server_id"`
    Hostname  string `json:"hostname"`
    OS        string `json:"os"`
    OSVersion string `json:"os_version"`
    IP        string `json:"ip"`
    Version   string `json:"version"`
}

// ==================== MAIN FUNCTIONS ====================

func main() {
    // Load configuration
    configPath := os.Getenv("CONFIG_PATH")
    if configPath == "" {
        configPath = "/etc/nexora/agent.yaml"
    }

    config, err := loadConfig(configPath)
    if err != nil {
        log.Printf("❌ Failed to load config: %v", err)
        log.Println("Using default configuration...")
        config = getDefaultConfig()
    }

    // Create agent
    agent := NewAgent(config)

    // Handle signals
    signalChan := make(chan os.Signal, 1)
    signal.Notify(signalChan, syscall.SIGINT, syscall.SIGTERM)

    go func() {
        <-signalChan
        log.Println("📴 Received shutdown signal, stopping agent...")
        agent.Stop()
    }()

    // Start agent
    log.Printf("🚀 Nexora Agent Starting...")
    log.Printf("📡 Server ID: %s", config.ServerID)
    log.Printf("🌐 Main Server: %s", config.MainServer)
    log.Printf("⏱️  Interval: %d seconds", config.Interval)
    log.Printf("💻 OS: %s", runtime.GOOS)
    log.Println("─────────────────────────────────────────")

    agent.Start()
}

// ==================== AGENT METHODS ====================

func NewAgent(config Config) *Agent {
    return &Agent{
        Config: config,
        HTTPClient: &http.Client{
            Timeout: 10 * time.Second,
        },
        StopChan: make(chan struct{}),
    }
}

func (a *Agent) Start() {
    // Register agent with server
    if err := a.Register(); err != nil {
        log.Printf("⚠️ Registration failed: %v", err)
    }

    // Start metrics collection
    ticker := time.NewTicker(time.Duration(a.Config.Interval) * time.Second)
    defer ticker.Stop()

    // Send first metrics immediately
    a.CollectAndSend()

    for {
        select {
        case <-ticker.C:
            a.CollectAndSend()
        case <-a.StopChan:
            return
        }
    }
}

func (a *Agent) Stop() {
    close(a.StopChan)
    log.Println("🛑 Agent stopped")
}

func (a *Agent) Register() error {
    hostname, _ := os.Hostname()
    ip := getLocalIP()

    registerData := RegisterData{
        ServerID:  a.Config.ServerID,
        Hostname:  hostname,
        OS:        runtime.GOOS,
        OSVersion: getOSVersion(),
        IP:        ip,
        Version:   "1.0.0",
    }

    jsonData, err := json.Marshal(registerData)
    if err != nil {
        return err
    }

    req, err := http.NewRequest("POST", 
        fmt.Sprintf("%s/api/agents/linux/register", a.Config.MainServer), 
        bytes.NewBuffer(jsonData))
    if err != nil {
        return err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Key", a.Config.APIKey)
    req.Header.Set("X-Server-ID", a.Config.ServerID)

    resp, err := a.HTTPClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
        body, _ := ioutil.ReadAll(resp.Body)
        return fmt.Errorf("registration failed: %d - %s", resp.StatusCode, string(body))
    }

    log.Printf("✅ Agent registered successfully with server: %s", a.Config.MainServer)
    return nil
}

func (a *Agent) CollectAndSend() {
    metrics, err := a.CollectMetrics()
    if err != nil {
        log.Printf("❌ Failed to collect metrics: %v", err)
        return
    }

    if err := a.SendMetrics(metrics); err != nil {
        log.Printf("❌ Failed to send metrics: %v", err)
        return
    }

    log.Printf("✅ Sent metrics: CPU=%.1f%% MEM=%.1f%% DISK=%.1f%%",
        metrics.CPU, metrics.Memory, metrics.Disk)
}

func (a *Agent) CollectMetrics() (*Metrics, error) {
    // CPU
    cpuPercent, err := cpu.Percent(time.Second, false)
    if err != nil {
        return nil, err
    }

    // Memory
    memInfo, err := mem.VirtualMemory()
    if err != nil {
        return nil, err
    }

    // Disk
    diskInfo, err := disk.Usage("/")
    if err != nil {
        return nil, err
    }

    // Load Average
    loadAvg, err := cpu.LoadAvg()
    if err != nil {
        loadAvg = &cpu.LoadAvgStat{}
    }

    // Process Count
    processes, err := process.Processes()
    if err != nil {
        return nil, err
    }

    // Network Stats
    netStats, err := net.IOCounters(true)
    if err != nil {
        return nil, err
    }

    var networks []NetworkStats
    for _, stat := range netStats {
        if stat.BytesSent > 0 || stat.BytesRecv > 0 {
            networks = append(networks, NetworkStats{
                Name:        stat.Name,
                BytesSent:   stat.BytesSent,
                BytesRecv:   stat.BytesRecv,
                PacketsSent: stat.PacketsSent,
                PacketsRecv: stat.PacketsRecv,
            })
        }
    }

    // Host Info
    hostInfo, _ := host.Info()
    hostname, _ := os.Hostname()

    // Custom metrics
    customMetrics := make(map[string]interface{})
    if runtime.GOOS == "linux" {
        customMetrics["kernel"] = hostInfo.KernelVersion
        customMetrics["platform"] = hostInfo.Platform
        customMetrics["platform_version"] = hostInfo.PlatformVersion
        customMetrics["cpu_count"] = runtime.NumCPU()
    }

    return &Metrics{
        ServerID:      a.Config.ServerID,
        Timestamp:     time.Now().Unix(),
        CPU:           cpuPercent[0],
        Memory:        memInfo.UsedPercent,
        Disk:          diskInfo.UsedPercent,
        LoadAvg:       []float64{loadAvg.Load1, loadAvg.Load5, loadAvg.Load15},
        ProcessCount:  int32(len(processes)),
        Network:       networks,
        OS:            runtime.GOOS,
        OSVersion:     hostInfo.PlatformVersion,
        Hostname:      hostname,
        Uptime:        hostInfo.Uptime,
        CustomMetrics: customMetrics,
    }, nil
}

func (a *Agent) SendMetrics(metrics *Metrics) error {
    jsonData, err := json.Marshal(metrics)
    if err != nil {
        return err
    }

    req, err := http.NewRequest("POST", 
        fmt.Sprintf("%s/api/agents/linux/metrics", a.Config.MainServer), 
        bytes.NewBuffer(jsonData))
    if err != nil {
        return err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Key", a.Config.APIKey)
    req.Header.Set("X-Server-ID", a.Config.ServerID)

    resp, err := a.HTTPClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
        body, _ := ioutil.ReadAll(resp.Body)
        return fmt.Errorf("server returned: %d - %s", resp.StatusCode, string(body))
    }

    return nil
}

// ==================== HELPER FUNCTIONS ====================

func loadConfig(path string) (Config, error) {
    data, err := ioutil.ReadFile(path)
    if err != nil {
        return Config{}, err
    }

    var config Config
    if err := yaml.Unmarshal(data, &config); err != nil {
        return Config{}, err
    }

    return config, nil
}

func getDefaultConfig() Config {
    serverID := os.Getenv("SERVER_ID")
    if serverID == "" {
        hostname, _ := os.Hostname()
        serverID = hostname
    }

    mainServer := os.Getenv("MAIN_SERVER")
    if mainServer == "" {
        mainServer = "https://nexora.yourdomain.com"
    }

    apiKey := os.Getenv("API_KEY")
    interval := 30

    return Config{
        ServerID:   serverID,
        MainServer: mainServer,
        APIKey:     apiKey,
        Interval:   interval,
        LogLevel:   "info",
    }
}

func getLocalIP() string {
    addrs, err := net.Interfaces()
    if err != nil {
        return "unknown"
    }

    for _, addr := range addrs {
        if addr.Flags&net.FlagUp != 0 && addr.Flags&net.FlagLoopback == 0 {
            if ip, ok := addr.Addrs[0].(*net.IPNet); ok && ip.IP.To4() != nil {
                return ip.IP.String()
            }
        }
    }
    return "unknown"
}

func getOSVersion() string {
    hostInfo, err := host.Info()
    if err != nil {
        return runtime.GOOS
    }
    return hostInfo.PlatformVersion
}