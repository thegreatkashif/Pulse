import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { SystemInfo, NetworkInterface, NetworkOverview, NetworkDevice } from '../api/types'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-400">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="text-neutral-100">{value}</span>
    </div>
  )
}

export default function Dashboard() {
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [network, setNetwork] = useState<NetworkOverview | null>(null)
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([])
  const [devices, setDevices] = useState<NetworkDevice[]>([])
  const [devicesLoading, setDevicesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fast-changing stats: poll every 5s
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [sys, net, ifaces] = await Promise.all([
          api.system(),
          api.network(),
          api.interfaces(),
        ])
        if (!cancelled) {
          setSystem(sys)
          setNetwork(net)
          setInterfaces(ifaces)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      }
    }

    load()
    const interval = setInterval(load, 5000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Slow ARP scan: fetch once on mount
  useEffect(() => {
    api
      .devices()
      .then(setDevices)
      .catch((err) => setError((err as Error).message))
      .finally(() => setDevicesLoading(false))
  }, [])

  if (error) {
    return <p className="p-6 text-red-400">Failed to reach backend: {error}</p>
  }

  if (!system || !network) {
    return <p className="p-6 text-neutral-400">Loading…</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
      <Card title="Host">
        <Row label="Hostname" value={system.hostname} />
        <Row label="OS" value={system.operating_system} />
        <Row label="Platform" value={system.platform} />
        <Row label="Architecture" value={system.architecture} />
        <Row label="Uptime" value={formatUptime(system.uptime.uptime_seconds)} />
      </Card>

      <Card title="CPU">
        <Row label="Model" value={system.cpu.model} />
        <Row label="Physical cores" value={system.cpu.physical_cores} />
        <Row label="Logical cores" value={system.cpu.logical_cores} />
        <Row
          label="Frequency"
          value={system.cpu.frequency_mhz ? `${system.cpu.frequency_mhz.toFixed(0)} MHz` : '—'}
        />
      </Card>

      <Card title="Memory">
        <Row label="Total" value={system.memory.total_human} />
        <Row label="Used" value={`${system.memory.used_human} (${system.memory.percent}%)`} />
        <Row label="Available" value={system.memory.available_human} />
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-neutral-800">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${system.memory.percent}%` }}
          />
        </div>
      </Card>

      <Card title="Network">
        <Row label="Active interface" value={network.active_interface ?? '—'} />
        <Row label="Internet" value={network.internet_connected ? 'Connected' : 'Offline'} />
        <Row label="Interfaces" value={network.interface_count} />
      </Card>

      <Card title="Interfaces">
        <div className="space-y-3">
          {interfaces
            .filter((i) => i.is_up)
            .map((iface) => (
              <div key={iface.name} className="border-t border-neutral-800 pt-2 first:border-t-0 first:pt-0">
                <Row label="Name" value={iface.name} />
                <Row label="IPv4" value={iface.ipv4.join(', ') || '—'} />
                <Row label="MAC" value={iface.mac ?? '—'} />
                <Row label="Speed" value={iface.speed_mbps ? `${iface.speed_mbps} Mbps` : '—'} />
              </div>
            ))}
        </div>
      </Card>

      <Card title="Devices on Network">
        {devicesLoading ? (
          <p className="text-sm text-neutral-400">Scanning…</p>
        ) : devices.length === 0 ? (
          <p className="text-sm text-neutral-400">No devices found</p>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.mac} className="border-t border-neutral-800 pt-2 first:border-t-0 first:pt-0">
                <Row label="IP" value={device.ip} />
                <Row label="MAC" value={device.mac} />
                <Row label="Hostname" value={device.hostname ?? '—'} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}