import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts'
import { usePacketSocket } from '../hooks/usePacketSocket'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const COLORS = ['#2f6fed', '#22d3ee', '#10b981', '#f59e0b', '#ef4444']

function formatBytes(num: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = num
  for (const unit of units) {
    if (value < 1024) return `${value.toFixed(1)} ${unit}`
    value /= 1024
  }
  return `${value.toFixed(1)} TB`
}

export default function Traffic() {
  const { packets, bandwidth } = usePacketSocket()

  const protocolData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of packets) counts[p.protocol] = (counts[p.protocol] ?? 0) + 1
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [packets])

  const topTalkers = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const p of packets) {
      const remote = p.direction === 'outbound' ? p.dst_ip : p.src_ip
      totals[remote] = (totals[remote] ?? 0) + p.length
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [packets])

  const bwData = bandwidth.map((b) => ({
    time: new Date(b.timestamp * 1000).toLocaleTimeString(),
    in: b.bytes_in,
    out: b.bytes_out,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Traffic</h1>
        <p className="text-sm text-muted-foreground">Live analysis of captured packets in this session</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Bandwidth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {bwData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No data yet — start capture on Packet Capture.</p>
            ) : (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bwData}>
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} />
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="in" stroke="var(--color-cyan)" dot={false} strokeWidth={2} name="In" />
                    <Line type="monotone" dataKey="out" stroke="var(--color-electric)" dot={false} strokeWidth={2} name="Out" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Protocol Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {protocolData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No packets captured yet.</p>
            ) : (
             <div className="flex justify-center">
                <PieChart width={260} height={200}>
                  <Pie data={protocolData} dataKey="value" nameKey="name" cx={130} cy={100} innerRadius={40} outerRadius={70} isAnimationActive={false}>
                    {protocolData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 12 }} />
                </PieChart>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {protocolData.map((p, i) => (
                <span key={p.name} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {p.name} ({p.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Talkers (this session)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Remote IP</th>
                <th className="px-4 py-2">Total Traffic</th>
              </tr>
            </thead>
            <tbody>
              {topTalkers.map(([ip, bytes]) => (
                <tr key={ip} className="border-t border-border/50">
                  <td className="px-4 py-2">{ip}</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatBytes(bytes)}</td>
                </tr>
              ))}
              {topTalkers.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                    No traffic captured yet.
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