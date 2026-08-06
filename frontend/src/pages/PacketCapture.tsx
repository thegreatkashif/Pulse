import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, ArrowDown, ArrowUp, Radio } from 'lucide-react'
import { usePacketSocket } from '../hooks/usePacketSocket'
import { api } from '../api/client'
import type { PacketEvent } from '../api/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'

function formatBytes(num: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = num
  for (const unit of units) {
    if (value < 1024) return `${value.toFixed(1)} ${unit}`
    value /= 1024
  }
  return `${value.toFixed(1)} TB`
}

export default function PacketCapture() {
  const { packets, bandwidth, connected } = usePacketSocket()
  const [capturing, setCapturing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<PacketEvent | null>(null)

  const latest = bandwidth[bandwidth.length - 1]

  async function toggleCapture() {
    setBusy(true)
    try {
      if (capturing) {
        await api.stopCapture()
        setCapturing(false)
      } else {
        await api.startCapture()
        setCapturing(true)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Packet Capture</h1>
          <p className="text-sm text-muted-foreground">Live traffic to and from this host</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald' : 'bg-crimson'}`} />
            {connected ? 'Socket live' : 'Reconnecting…'}
          </span>
          <Button
            onClick={toggleCapture}
            disabled={busy}
            variant={capturing ? 'destructive' : 'default'}
            className={capturing ? '' : 'bg-electric hover:bg-electric/90'}
          >
            {capturing ? <Square size={14} /> : <Play size={14} />}
            {capturing ? 'Stop Capture' : 'Start Capture'}
          </Button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 pt-6">
            <ArrowDown size={18} className="text-cyan" />
            <div>
              <p className="text-xs text-muted-foreground">Inbound</p>
              <p className="font-semibold">{latest ? formatBytes(latest.bytes_in) : '0 B'}/s</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 pt-6">
            <ArrowUp size={18} className="text-electric" />
            <div>
              <p className="text-xs text-muted-foreground">Outbound</p>
              <p className="font-semibold">{latest ? formatBytes(latest.bytes_out) : '0 B'}/s</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 pt-6">
            <Radio size={18} className="text-emerald" />
            <div>
              <p className="text-xs text-muted-foreground">Packets Seen</p>
              <p className="font-semibold">{packets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 pt-6">
            <Badge variant="outline" className={capturing ? 'border-emerald text-emerald' : 'border-muted-foreground text-muted-foreground'}>
              {capturing ? 'Capturing' : 'Idle'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-0 flex-1 border-border bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Live Stream</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-3.5rem)] p-0">
          <ScrollArea className="h-full px-4 pb-4">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-2">Time</th>
                  <th className="py-2 pr-2">Dir</th>
                  <th className="py-2 pr-2">Protocol</th>
                  <th className="py-2 pr-2">Source</th>
                  <th className="py-2 pr-2">Destination</th>
                  <th className="py-2 pr-2">Size</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {packets.map((p, i) => (
                    <motion.tr
                      key={`${p.timestamp}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelected(p)}
                      className="cursor-pointer border-t border-border/50 hover:bg-secondary/50"
                    >
                      <td className="py-1.5 pr-2 text-muted-foreground">
                        {new Date(p.timestamp * 1000).toLocaleTimeString()}
                      </td>
                      <td className={`py-1.5 pr-2 font-semibold ${p.direction === 'outbound' ? 'text-electric' : 'text-cyan'}`}>
                        {p.direction === 'outbound' ? '↑ OUT' : '↓ IN'}
                      </td>
                      <td className="py-1.5 pr-2">{p.protocol}</td>
                      <td className="py-1.5 pr-2">
                        {p.src_ip}
                        {p.src_port ? `:${p.src_port}` : ''}
                      </td>
                      <td className="py-1.5 pr-2">
                        {p.dst_ip}
                        {p.dst_port ? `:${p.dst_port}` : ''}
                      </td>
                      <td className="py-1.5 pr-2 text-muted-foreground">{p.length}B</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {packets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      {capturing ? 'Waiting for packets…' : 'Start capture to see live traffic'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="border-border bg-surface">
          <DialogHeader>
            <DialogTitle>Packet Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <DetailRow label="Timestamp" value={new Date(selected.timestamp * 1000).toLocaleString()} />
              <DetailRow label="Direction" value={selected.direction} />
              <DetailRow label="Protocol" value={selected.protocol} />
              <DetailRow label="Source IP" value={selected.src_ip} />
              <DetailRow label="Source Port" value={selected.src_port ?? '—'} />
              <DetailRow label="Destination IP" value={selected.dst_ip} />
              <DetailRow label="Destination Port" value={selected.dst_port ?? '—'} />
              <DetailRow label="Length" value={`${selected.length} bytes`} />
              <div className="mt-3 rounded-md bg-muted p-2 font-mono text-xs text-muted-foreground">
                {selected.summary}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border/50 pb-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}