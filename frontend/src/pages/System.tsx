import { Cpu, MemoryStick, Clock, Server } from 'lucide-react'
import { useStatsSocket } from '../hooks/useStatsSocket'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { motion } from 'framer-motion'

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}

export default function System() {
  const { system, connected } = useStatsSocket()

  if (!system) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">System</h1>
          <p className="text-sm text-muted-foreground">Live host diagnostics</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald' : 'bg-crimson'}`} />
          {connected ? 'Live' : 'Reconnecting…'}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-surface">
          <CardHeader className="flex flex-row items-center gap-2">
            <Server size={16} className="text-electric" />
            <CardTitle className="text-sm font-medium">Host</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Hostname" value={system.hostname} />
            <Row label="OS" value={system.operating_system} />
            <Row label="Platform" value={system.platform} />
            <Row label="Architecture" value={system.architecture} />
            <Row label="Uptime" value={formatUptime(system.uptime.uptime_seconds)} />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader className="flex flex-row items-center gap-2">
            <Cpu size={16} className="text-cyan" />
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Model" value={system.cpu.model} />
            <Row label="Physical cores" value={system.cpu.physical_cores} />
            <Row label="Logical cores" value={system.cpu.logical_cores} />
            <Row label="Frequency" value={system.cpu.frequency_mhz ? `${system.cpu.frequency_mhz.toFixed(0)} MHz` : '—'} />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <MemoryStick size={16} className="text-emerald" />
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Total" value={system.memory.total_human} />
            <Row label="Used" value={`${system.memory.used_human} (${system.memory.percent}%)`} />
            <Row label="Available" value={system.memory.available_human} />
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-electric to-cyan"
                animate={{ width: `${system.memory.percent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>
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