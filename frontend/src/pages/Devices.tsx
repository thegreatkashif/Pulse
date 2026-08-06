import { useEffect, useState } from 'react'
import { LayoutGrid, List, RefreshCw } from 'lucide-react'
import { api } from '../api/client'
import type { NetworkDevice, NetworkOverview } from '../api/types'
import DeviceCard from '../components/devices/DeviceCard'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Link } from 'react-router-dom'

export default function Devices() {
  const [devices, setDevices] = useState<NetworkDevice[]>([])
  const [network, setNetwork] = useState<NetworkOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'table'>('grid')

  function load() {
    setLoading(true)
    Promise.all([api.devices(), api.network()])
      .then(([d, n]) => {
        setDevices(d)
        setNetwork(n)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Devices</h1>
          <p className="text-sm text-muted-foreground">{devices.length} device(s) discovered on this network</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Rescan
          </Button>
          <div className="flex rounded-md border border-border">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 ${view === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 ${view === 'table' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading && devices.length === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      )}

      {!loading && devices.length === 0 && (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          No devices found. Make sure the backend is running as Administrator.
        </div>
      )}

      {view === 'grid' && devices.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((d) => (
            <DeviceCard key={d.ip} device={d} isGateway={d.ip === network?.default_gateway} />
          ))}
        </div>
      )}

      {view === 'table' && devices.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Hostname</th>
                <th className="px-4 py-2">IP</th>
                <th className="px-4 py-2">MAC</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.ip} className="border-t border-border hover:bg-surface-hover">
                  <td className="px-4 py-2">
                    <Link to={`/devices/${d.ip}`} className="text-electric hover:underline">
                      {d.hostname ?? '—'}
                    </Link>
                    {d.ip === network?.default_gateway && (
                      <span className="ml-2 text-xs text-cyan">(gateway)</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{d.ip}</td>
                  <td className="px-4 py-2 text-muted-foreground">{d.mac}</td>
                  <td className="px-4 py-2">
                    <span className={d.online ? 'text-emerald' : 'text-muted-foreground'}>
                      {d.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}