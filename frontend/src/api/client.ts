import type { SystemInfo, NetworkInterface, NetworkOverview, NetworkDevice } from './types'

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

export const api = {
  system: () => get<SystemInfo>('/api/system'),
  interfaces: () => get<NetworkInterface[]>('/api/system/interfaces'),
  network: () => get<NetworkOverview>('/api/system/network'),
  devices: () => get<NetworkDevice[]>('/api/network/devices'),
  startCapture: () => post<{ running: boolean }>('/api/capture/start'),
  stopCapture: () => post<{ running: boolean }>('/api/capture/stop'),
  captureStatus: () => get<{ running: boolean }>('/api/capture/status'),
}