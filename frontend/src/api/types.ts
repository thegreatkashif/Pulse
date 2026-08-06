export interface CPUInfo {
  model: string
  physical_cores: number
  logical_cores: number
  frequency_mhz: number | null
}

export interface MemoryInfo {
  total_bytes: number
  total_human: string
  available_bytes: number
  available_human: string
  used_bytes: number
  used_human: string
  percent: number
}

export interface DiskInfo {
  total_bytes: number
  total_human: string
  used_bytes: number
  used_human: string
  free_bytes: number
  free_human: string
  percent: number
}

export interface TemperatureInfo {
  available: boolean
  celsius: number | null
  label: string | null
  note: string
}

export interface UptimeInfo {
  boot_time: string
  uptime_seconds: number
}

export interface SystemInfo {
  hostname: string
  operating_system: string
  platform: string
  architecture: string
  cpu: CPUInfo
  memory: MemoryInfo
  disk: DiskInfo
  temperature: TemperatureInfo
  uptime: UptimeInfo
}

export interface NetworkInterface {
  name: string
  is_up: boolean
  mtu: number
  speed_mbps: number
  mac: string | null
  ipv4: string[]
  ipv6: string[]
}

export interface NetworkOverview {
  default_gateway: string | null
  active_interface: string | null
  internet_connected: boolean
  interface_count: number
}

export interface NetworkDevice {
  ip: string
  mac: string
  hostname: string | null
  vendor: string | null
  online: boolean
}

export interface PacketEvent {
  timestamp: number
  src_ip: string
  dst_ip: string
  src_port: number | null
  dst_port: number | null
  protocol: string
  length: number
  direction: 'inbound' | 'outbound'
  summary: string
}

export interface BandwidthSample {
  bytes_in: number
  bytes_out: number
  timestamp: number
}

export interface TopologyEvidence {
  gateway_ip: string | null
  gateway_mac: string | null
  local_direct_frames: number
  gateway_relayed_frames: number
  classification: string
  explanation: string
}

export interface SecurityAlert {
  timestamp: number
  severity: 'info' | 'warning' | 'critical'
  category: 'port_scan' | 'arp_spoof' | 'traffic_spike'
  message: string
}

export interface DnsQuery {
  id: number
  timestamp: number
  domain: string
  resolved_ips: string | null
}

export interface CapturePreferences {
  interface: string | null
  port_scan_threshold: number
  port_scan_window: number
  spike_multiplier: number
  spike_min_baseline: number
  spike_sustain_samples: number
  spike_cooldown: number
}

export interface RetentionSettings {
  retention_days: number
}