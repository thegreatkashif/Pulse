import { useEffect, useState } from 'react'
import { Wifi, Router } from 'lucide-react'
import { api } from '../api/client'
import type { NetworkInterface, NetworkOverview } from '../api/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'

export default function Network() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([])
  const [overview, setOverview] = useState<NetworkOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.interfaces(), api.network()])
      .then(([i, o]) => {
        setInterfaces(i)
        setOverview(o)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Network</h1>
        <p className="text-sm text-muted-foreground">Interfaces and connectivity overview</p>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader className="flex flex-row items-center gap-2">
          <Router size={16} className="text-cyan" />
          <CardTitle className="text-sm font-medium">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Gateway</p>
            <p className="font-medium">{overview?.default_gateway ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Interface</p>
            <p className="font-medium">{overview?.active_interface ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Internet</p>
            <Badge variant="outline" className={overview?.internet_connected ? 'border-emerald text-emerald' : 'border-crimson text-crimson'}>
              {overview?.internet_connected ? 'Connected' : 'Offline'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Interfaces</p>
            <p className="font-medium">{overview?.interface_count ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {interfaces.filter((i) => i.is_up).map((iface) => (
          <Card key={iface.name} className="border-border bg-surface">
            <CardHeader className="flex flex-row items-center gap-2">
              <Wifi size={16} className="text-electric" />
              <CardTitle className="text-sm font-medium">{iface.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="IPv4" value={iface.ipv4.join(', ') || '—'} />
              <Row label="MAC" value={iface.mac ?? '—'} />
              <Row label="MTU" value={iface.mtu} />
              <Row label="Speed" value={iface.speed_mbps ? `${iface.speed_mbps} Mbps` : '—'} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}