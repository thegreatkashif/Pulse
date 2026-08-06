import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { api } from '../api/client'
import { usePacketSocket } from '../hooks/usePacketSocket'
import type { DnsQuery } from '../api/types'
import { Card, CardContent } from '../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'

export default function Logs() {
  const { packets } = usePacketSocket()
  const [dns, setDns] = useState<DnsQuery[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.dnsRecent(200).then(setDns).catch(() => {})
  }, [])

  const filteredDns = useMemo(
    () => dns.filter((d) => d.domain.toLowerCase().includes(query.toLowerCase())),
    [dns, query]
  )

  const filteredPackets = useMemo(
    () =>
      packets.filter(
        (p) =>
          p.src_ip.includes(query) ||
          p.dst_ip.includes(query) ||
          p.protocol.toLowerCase().includes(query.toLowerCase())
      ),
    [packets, query]
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Logs</h1>
        <p className="text-sm text-muted-foreground">DNS queries and packet history</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter logs…"
          className="w-full rounded-md border border-border bg-secondary/50 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-electric"
        />
      </div>

      <Tabs defaultValue="dns">
        <TabsList>
          <TabsTrigger value="dns">DNS Queries ({filteredDns.length})</TabsTrigger>
          <TabsTrigger value="packets">Packet Log ({filteredPackets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dns">
          <Card className="border-border bg-surface">
            <CardContent className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Domain</th>
                    <th className="px-4 py-2">Resolved IPs</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDns.map((d) => (
                    <tr key={d.id} className="border-t border-border/50">
                      <td className="px-4 py-1.5 text-muted-foreground">
                        {new Date(d.timestamp * 1000).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-1.5">{d.domain}</td>
                      <td className="px-4 py-1.5 text-muted-foreground">{d.resolved_ips ?? '—'}</td>
                    </tr>
                  ))}
                  {filteredDns.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                        No DNS activity logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packets">
          <Card className="border-border bg-surface">
            <CardContent className="max-h-[500px] overflow-y-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Protocol</th>
                    <th className="px-4 py-2">Source</th>
                    <th className="px-4 py-2">Destination</th>
                    <th className="px-4 py-2">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackets.map((p, i) => (
                    <tr key={`${p.timestamp}-${i}`} className="border-t border-border/50">
                      <td className="px-4 py-1.5 text-muted-foreground">
                        {new Date(p.timestamp * 1000).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-1.5">{p.protocol}</td>
                      <td className="px-4 py-1.5">{p.src_ip}{p.src_port ? `:${p.src_port}` : ''}</td>
                      <td className="px-4 py-1.5">{p.dst_ip}{p.dst_port ? `:${p.dst_port}` : ''}</td>
                      <td className="px-4 py-1.5 text-muted-foreground">{p.length}B</td>
                    </tr>
                  ))}
                  {filteredPackets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No packets captured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}