using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Management;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace NexoraAgent
{
    // ==================== CONFIGURATION ====================

    public class Config
    {
        public string ServerId { get; set; }
        public string MainServer { get; set; }
        public string ApiKey { get; set; }
        public int Interval { get; set; }
        public string LogLevel { get; set; }
        public bool UseTLS { get; set; }
    }

    // ==================== METRICS STRUCTURES ====================

    public class Metrics
    {
        [JsonProperty("server_id")]
        public string ServerId { get; set; }

        [JsonProperty("timestamp")]
        public long Timestamp { get; set; }

        [JsonProperty("cpu")]
        public double Cpu { get; set; }

        [JsonProperty("memory")]
        public double Memory { get; set; }

        [JsonProperty("disk")]
        public double Disk { get; set; }

        [JsonProperty("load_avg")]
        public double[] LoadAvg { get; set; }

        [JsonProperty("process_count")]
        public int ProcessCount { get; set; }

        [JsonProperty("network")]
        public List<NetworkStats> Network { get; set; }

        [JsonProperty("os")]
        public string OS { get; set; }

        [JsonProperty("os_version")]
        public string OSVersion { get; set; }

        [JsonProperty("hostname")]
        public string Hostname { get; set; }

        [JsonProperty("uptime")]
        public long Uptime { get; set; }

        [JsonProperty("custom_metrics")]
        public Dictionary<string, object> CustomMetrics { get; set; }
    }

    public class NetworkStats
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("bytes_sent")]
        public long BytesSent { get; set; }

        [JsonProperty("bytes_recv")]
        public long BytesRecv { get; set; }

        [JsonProperty("packets_sent")]
        public long PacketsSent { get; set; }

        [JsonProperty("packets_recv")]
        public long PacketsRecv { get; set; }
    }

    public class RegisterData
    {
        [JsonProperty("server_id")]
        public string ServerId { get; set; }

        [JsonProperty("hostname")]
        public string Hostname { get; set; }

        [JsonProperty("os")]
        public string OS { get; set; }

        [JsonProperty("os_version")]
        public string OSVersion { get; set; }

        [JsonProperty("ip")]
        public string IP { get; set; }

        [JsonProperty("version")]
        public string Version { get; set; }
    }

    // ==================== MAIN AGENT CLASS ====================

    public class Agent
    {
        private readonly Config _config;
        private readonly HttpClient _httpClient;
        private readonly CancellationTokenSource _cancellationTokenSource;
        private bool _isRunning;

        public Agent(Config config)
        {
            _config = config;
            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(10)
            };
            _cancellationTokenSource = new CancellationTokenSource();
            _isRunning = false;
        }

        public async Task StartAsync()
        {
            Console.WriteLine("🚀 Nexora Agent Starting...");
            Console.WriteLine($"📡 Server ID: {_config.ServerId}");
            Console.WriteLine($"🌐 Main Server: {_config.MainServer}");
            Console.WriteLine($"⏱️  Interval: {_config.Interval} seconds");
            Console.WriteLine($"💻 OS: Windows");
            Console.WriteLine("─────────────────────────────────────────");

            _isRunning = true;

            // Register agent
            await RegisterAsync();

            // Start metrics collection
            await CollectAndSendLoop();
        }

        public void Stop()
        {
            Console.WriteLine("🛑 Stopping agent...");
            _isRunning = false;
            _cancellationTokenSource.Cancel();
        }

        private async Task CollectAndSendLoop()
        {
            // Send first metrics immediately
            await CollectAndSendAsync();

            while (_isRunning && !_cancellationTokenSource.Token.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(_config.Interval * 1000, _cancellationTokenSource.Token);
                    await CollectAndSendAsync();
                }
                catch (TaskCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error in collection loop: {ex.Message}");
                }
            }
        }

        public async Task RegisterAsync()
        {
            try
            {
                var registerData = new RegisterData
                {
                    ServerId = _config.ServerId,
                    Hostname = Environment.MachineName,
                    OS = "Windows",
                    OSVersion = Environment.OSVersion.VersionString,
                    IP = GetLocalIPAddress(),
                    Version = "1.0.0"
                };

                var json = JsonConvert.SerializeObject(registerData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, 
                    $"{_config.MainServer}/api/agents/windows/register");
                request.Headers.Add("X-API-Key", _config.ApiKey);
                request.Headers.Add("X-Server-ID", _config.ServerId);
                request.Content = content;

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"✅ Agent registered successfully with server: {_config.MainServer}");
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"⚠️ Registration failed: {response.StatusCode} - {error}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Registration error: {ex.Message}");
            }
        }

        private async Task CollectAndSendAsync()
        {
            try
            {
                var metrics = CollectMetrics();
                await SendMetricsAsync(metrics);
                Console.WriteLine($"✅ Sent metrics: CPU={metrics.Cpu:F1}% MEM={metrics.Memory:F1}% DISK={metrics.Disk:F1}%");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to collect/send metrics: {ex.Message}");
            }
        }

        private Metrics CollectMetrics()
        {
            var metrics = new Metrics
            {
                ServerId = _config.ServerId,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                OS = "Windows",
                OSVersion = Environment.OSVersion.VersionString,
                Hostname = Environment.MachineName,
                CustomMetrics = new Dictionary<string, object>(),
                Network = new List<NetworkStats>()
            };

            // CPU Usage
            try
            {
                using (var cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total"))
                {
                    cpuCounter.NextValue(); // First call returns 0
                    Thread.Sleep(100);
                    metrics.Cpu = Math.Round(cpuCounter.NextValue(), 2);
                }
            }
            catch
            {
                metrics.Cpu = 0;
            }

            // Memory Usage
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT TotalVisibleMemorySize, FreePhysicalMemory FROM Win32_ComputerSystem"))
                {
                    var result = searcher.Get().GetEnumerator();
                    if (result.MoveNext())
                    {
                        var total = Convert.ToDouble(result.Current["TotalVisibleMemorySize"]);
                        var free = Convert.ToDouble(result.Current["FreePhysicalMemory"]);
                        metrics.Memory = Math.Round((total - free) / total * 100, 2);
                    }
                }
            }
            catch
            {
                metrics.Memory = 0;
            }

            // Disk Usage
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT Size, FreeSpace FROM Win32_LogicalDisk WHERE DriveType=3 AND DeviceID='C:'"))
                {
                    var result = searcher.Get().GetEnumerator();
                    if (result.MoveNext())
                    {
                        var total = Convert.ToDouble(result.Current["Size"]);
                        var free = Convert.ToDouble(result.Current["FreeSpace"]);
                        metrics.Disk = Math.Round((total - free) / total * 100, 2);
                    }
                }
            }
            catch
            {
                metrics.Disk = 0;
            }

            // Load Average (Windows doesn't have traditional load avg)
            metrics.LoadAvg = new double[] { 0, 0, 0 };

            // Process Count
            try
            {
                metrics.ProcessCount = Process.GetProcesses().Length;
            }
            catch
            {
                metrics.ProcessCount = 0;
            }

            // Network Stats
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT Name, BytesSentPerSec, BytesReceivedPerSec FROM Win32_PerfFormattedData_Tcpip_NetworkInterface"))
                {
                    var results = searcher.Get();
                    foreach (ManagementObject obj in results)
                    {
                        var name = obj["Name"]?.ToString() ?? "Unknown";
                        var bytesSent = Convert.ToInt64(obj["BytesSentPerSec"] ?? 0);
                        var bytesRecv = Convert.ToInt64(obj["BytesReceivedPerSec"] ?? 0);
                        
                        if (bytesSent > 0 || bytesRecv > 0)
                        {
                            metrics.Network.Add(new NetworkStats
                            {
                                Name = name,
                                BytesSent = bytesSent,
                                BytesRecv = bytesRecv,
                                PacketsSent = 0,
                                PacketsRecv = 0
                            });
                        }
                    }
                }
            }
            catch
            {
                // Network stats unavailable
            }

            // Uptime
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT LastBootUpTime FROM Win32_OperatingSystem"))
                {
                    var result = searcher.Get().GetEnumerator();
                    if (result.MoveNext())
                    {
                        var bootTime = ManagementDateTimeConverter.ToDateTime(result.Current["LastBootUpTime"].ToString());
                        metrics.Uptime = (long)(DateTime.Now - bootTime).TotalSeconds;
                    }
                }
            }
            catch
            {
                metrics.Uptime = 0;
            }

            // Windows Custom Metrics
            metrics.CustomMetrics["windows_version"] = Environment.OSVersion.Version.ToString();
            metrics.CustomMetrics["architecture"] = Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit";
            metrics.CustomMetrics["processor_count"] = Environment.ProcessorCount;

            return metrics;
        }

        private async Task SendMetricsAsync(Metrics metrics)
        {
            var json = JsonConvert.SerializeObject(metrics);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, 
                $"{_config.MainServer}/api/agents/windows/metrics");
            request.Headers.Add("X-API-Key", _config.ApiKey);
            request.Headers.Add("X-Server-ID", _config.ServerId);
            request.Content = content;

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Server returned {response.StatusCode}: {error}");
            }
        }

        private string GetLocalIPAddress()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT IPAddress FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled=True"))
                {
                    var results = searcher.Get();
                    foreach (ManagementObject obj in results)
                    {
                        var addresses = obj["IPAddress"] as string[];
                        if (addresses != null)
                        {
                            foreach (var ip in addresses)
                            {
                                if (!ip.StartsWith("169.254") && !ip.StartsWith("::"))
                                {
                                    return ip;
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                // Return default
            }
            return "unknown";
        }
    }

    // ==================== PROGRAM ENTRY POINT ====================

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("🚀 Nexora Windows Agent");
            Console.WriteLine("=========================");

            try
            {
                // Load configuration
                var config = LoadConfig();

                // Create and start agent
                var agent = new Agent(config);

                // Handle Ctrl+C
                Console.CancelKeyPress += (sender, e) =>
                {
                    Console.WriteLine("📴 Received shutdown signal...");
                    agent.Stop();
                    e.Cancel = true;
                };

                // Run agent
                agent.StartAsync().Wait();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fatal error: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                Environment.ExitCode = 1;
            }
        }

        static Config LoadConfig()
        {
            var config = new Config
            {
                ServerId = Environment.GetEnvironmentVariable("SERVER_ID") ?? Environment.MachineName,
                MainServer = Environment.GetEnvironmentVariable("MAIN_SERVER") ?? "https://nexora.yourdomain.com",
                ApiKey = Environment.GetEnvironmentVariable("API_KEY") ?? "",
                Interval = int.TryParse(Environment.GetEnvironmentVariable("INTERVAL"), out var interval) ? interval : 30,
                LogLevel = Environment.GetEnvironmentVariable("LOG_LEVEL") ?? "info",
                UseTLS = true
            };

            // Try to load from config file
            var configPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramData),
                "Nexora", "agent.json");

            if (File.Exists(configPath))
            {
                try
                {
                    var json = File.ReadAllText(configPath);
                    var fileConfig = JsonConvert.DeserializeObject<Config>(json);
                    if (fileConfig != null)
                    {
                        // Merge configurations
                        if (!string.IsNullOrEmpty(fileConfig.ServerId)) config.ServerId = fileConfig.ServerId;
                        if (!string.IsNullOrEmpty(fileConfig.MainServer)) config.MainServer = fileConfig.MainServer;
                        if (!string.IsNullOrEmpty(fileConfig.ApiKey)) config.ApiKey = fileConfig.ApiKey;
                        if (fileConfig.Interval > 0) config.Interval = fileConfig.Interval;
                        if (!string.IsNullOrEmpty(fileConfig.LogLevel)) config.LogLevel = fileConfig.LogLevel;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error loading config file: {ex.Message}");
                }
            }

            if (string.IsNullOrEmpty(config.ApiKey))
            {
                Console.WriteLine("❌ API Key is required");
                Console.WriteLine("Set API_KEY environment variable or create config file");
                Environment.Exit(1);
            }

            return config;
        }
    }
}