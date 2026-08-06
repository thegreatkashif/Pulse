import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Laptop2, Router } from 'lucide-react'
import { api } from '../api/client'
import { usePacketSocket } from '../hooks/usePacketSocket'
import type { NetworkDevice, NetworkOverview } from '../api/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export default function DeviceDetail() {
  const { ip } = useParams<{ ip: string }>()
  const { packets } = usePacketSocket()
  const [device, setDevice] = useState<NetworkDevice | null>(null)
  const [network, setNetwork] = useState<NetworkOverview | null>(null)

  useEffect(() => {
    api.devices().then((all) => setDevice(all.find((d) => d.ip === ip) ?? null))
    api.network().then(setNetwork)
  }, [ip])

  const relatedPackets = useMemo(() => packets.filter((p) => p.src_ip === ip || p.dst_ip === ip), [packets, ip])

  const protocolCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of relatedPackets) counts[p.protocol] = (counts[p.protocol] ?? 0) + 1
    return counts
  }, [relatedPackets])

  const isGateway = ip === network?.default_gateway
  const Icon = isGateway ? Router : Laptop2

  return (
    <div className="space-y-4">
      <Link to="/devices" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Back to Devices
      </Link>

      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-4 ${isGateway ? 'bg-cyan/10 text-cyan' : 'bg-electric/10 text-electric'}`}>
          <Icon size={28} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{device?.hostname ?? ip}</h1>
          <p className="text-sm text-muted-foreground">{ip}</p>
        </div>
        {device && (
          <Badge variant="outline" className={device.online ? 'ml-auto border-emerald text-emerald' : 'ml-auto border-muted-foreground text-muted-foreground'}>
            {device.online ? 'Online' : 'Offline'}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-medium">ARP Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="IP Address" value={ip ?? '—'} />
            <Row label="MAC Address" value={device?.mac ?? '—'} />
            <Row label="Vendor" value="Unknown — vendor lookup not implemented yet" />
            <Row label="Role" value={isGateway ? 'Default gateway' : 'Local device'} />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Protocol Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.keys(protocolCounts).length === 0 ? (
              <p className="text-muted-foreground">
                No traffic to/from this device seen yet. Start capture on Packet Capture to gather live data
                {isGateway ? '' : ' — note this only shows traffic that passed through this host, not the device\'s full activity'}.
              </p>
            ) : (
              Object.entries(protocolCounts).map(([proto, count]) => (
                <Row key={proto} label={proto} value={`${count} packet(s)`} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Protocol</th>
                <th className="px-4 py-2">Direction</th>
                <th className="px-4 py-2">Size</th>
              </tr>
            </thead>
            <tbody>
              {relatedPackets.slice(0, 20).map((p, i) => (
                <tr key={`${p.timestamp}-${i}`} className="border-t border-border/50">
                  <td className="px-4 py-1.5 text-muted-foreground">
                    {new Date(p.timestamp * 1000).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-1.5">{p.protocol}</td>
                  <td className="px-4 py-1.5">{p.direction}</td>
                  <td className="px-4 py-1.5 text-muted-foreground">{p.length}B</td>
                </tr>
              ))}
              {relatedPackets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No activity captured for this device yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-b border-border/50 pb-1.5 last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}