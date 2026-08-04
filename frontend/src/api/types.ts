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
  online:  boolean
}