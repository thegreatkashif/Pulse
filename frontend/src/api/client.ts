import type {
  SystemInfo,
  NetworkInterface,
  NetworkOverview,
  NetworkDevice,
  SecurityAlert,
  DnsQuery,
  CapturePreferences,
  RetentionSettings,
} from './types'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Request to ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

async function post<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'POST' })
  if (!res.ok) throw new Error(`Request to ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Request to ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  system: () => get<SystemInfo>('/api/system'),
  interfaces: () => get<NetworkInterface[]>('/api/system/interfaces'),
  network: () => get<NetworkOverview>('/api/system/network'),
  devices: () => get<NetworkDevice[]>('/api/network/devices'),
  startCapture: () => post<{ running: boolean }>('/api/capture/start'),
  stopCapture: () => post<{ running: boolean }>('/api/capture/stop'),
  captureStatus: () => get<{ running: boolean }>('/api/capture/status'),
  securityAlerts: (limit = 100) => get<SecurityAlert[]>(`/api/security/alerts?limit=${limit}`),
  dnsRecent: (limit = 100) => get<DnsQuery[]>(`/api/dns/recent?limit=${limit}`),
  getCapturePreferences: () => get<CapturePreferences>('/api/settings/capture'),
  saveCapturePreferences: (prefs: CapturePreferences) => put<CapturePreferences>('/api/settings/capture', prefs),
  getRetentionSettings: () => get<RetentionSettings>('/api/settings/retention'),
  saveRetentionSettings: (settings: RetentionSettings) => put<RetentionSettings>('/api/settings/retention', settings),
}