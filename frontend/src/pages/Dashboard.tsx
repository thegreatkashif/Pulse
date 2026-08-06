import { motion } from 'framer-motion'
import { Cpu, MemoryStick, Clock, Wifi, Activity, ShieldCheck, HardDrive, Thermometer } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useStatsSocket } from '../hooks/useStatsSocket'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}

export default function Dashboard() {
  const { system, network, connected } = useStatsSocket()

  if (!system || !network) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{system.hostname} · {system.operating_system}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald' : 'bg-crimson'}`} />
          {connected ? 'Live' : 'Reconnecting…'}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="CPU Cores" value={system.cpu.logical_cores} icon={Cpu} accent="electric" sublabel={system.cpu.model} />
        <StatCard
          label="Memory"
          value={`${system.memory.percent}%`}
          icon={MemoryStick}
          accent="cyan"
          sublabel={`${system.memory.used_human} / ${system.memory.total_human}`}
        />
        <StatCard label="Uptime" value={formatUptime(system.uptime.uptime_seconds)} icon={Clock} accent="emerald" />
        <StatCard
          label="Network"
          value={network.internet_connected ? 'Online' : 'Offline'}
          icon={Wifi}
          accent={network.internet_connected ? 'emerald' : 'crimson'}
          sublabel={network.active_interface ?? undefined}
        />
        <StatCard
          label="Disk Usage"
          value={`${system.disk.percent}%`}
          icon={HardDrive}
          accent={system.disk.percent > 90 ? 'crimson' : 'amber'}
          sublabel={`${system.disk.used_human} / ${system.disk.total_human}`}
        />
        <StatCard
          label="Temperature"
          value={system.temperature.available ? `${system.temperature.celsius?.toFixed(1)}°C` : '—'}
          icon={Thermometer}
          accent={system.temperature.available ? 'emerald' : 'amber'}
          sublabel={system.temperature.available ? system.temperature.label ?? undefined : system.temperature.note}
        />
        <StatCard label="Interfaces" value={network.interface_count} icon={Activity} accent="electric" />
        <StatCard label="Alerts" value={0} icon={ShieldCheck} accent="emerald" sublabel="No active threats" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Model" value={system.cpu.model} />
            <Row label="Physical cores" value={system.cpu.physical_cores} />
            <Row label="Logical cores" value={system.cpu.logical_cores} />
            <Row
              label="Frequency"
              value={system.cpu.frequency_mhz ? `${system.cpu.frequency_mhz.toFixed(0)} MHz` : '—'}
            />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
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