package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"
)

// ==================== HEALTH CHECK SERVER ====================

type HealthServer struct {
    Port   int
    Status string
}

func (h *HealthServer) Start() {
    http.HandleFunc("/health", h.healthHandler)
    http.HandleFunc("/ready", h.readyHandler)
    
    addr := fmt.Sprintf(":%d", h.Port)
    log.Printf("🏥 Health check server listening on %s", addr)
    
    if err := http.ListenAndServe(addr, nil); err != nil {
        log.Printf("⚠️ Health check server error: %v", err)
    }
}

func (h *HealthServer) healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "healthy",
        "timestamp": time.Now().Unix(),
        "uptime": time.Now().Unix() - startTime,
    })
}

func (h *HealthServer) readyHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    if h.Status == "ready" {
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{"status": "ready"})
    } else {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{"status": "not ready"})
    }
}

// ==================== VERSION INFORMATION ====================

var (
    Version   = "1.0.0"
    GitCommit = "unknown"
    BuildTime = "unknown"
    startTime = time.Now().Unix()
)

func printVersion() {
    fmt.Printf("Nexora Agent v%s\n", Version)
    fmt.Printf("Git Commit: %s\n", GitCommit)
    fmt.Printf("Build Time: %s\n", BuildTime)
}

// ==================== SIGNAL HANDLING ====================

func setupSignalHandler() {
    // Placeholder for signal handling
    // (Full implementation in main agent files)
}

// ==================== UTILITY FUNCTIONS ====================

func getEnvOrDefault(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

func getEnvIntOrDefault(key string, defaultValue int) int {
    if value := os.Getenv(key); value != "" {
        if intVal, err := fmt.Sscanf(value, "%d", new(int)); err == nil && intVal == 1 {
            return intVal
        }
    }
    return defaultValue
}

// ==================== MAIN ENTRY POINT ====================

func main() {
    // This is a shared file, actual main() in agent.go
    fmt.Println("Nexora Agent Common Library")
}