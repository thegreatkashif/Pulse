import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { cn } from '../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ size?: number; className?: string }>
  accent?: 'electric' | 'cyan' | 'emerald' | 'amber' | 'crimson'
  sublabel?: string
}

const ACCENT_MAP = {
  electric: 'text-electric',
  cyan: 'text-cyan',
  emerald: 'text-emerald',
  amber: 'text-amber',
  crimson: 'text-crimson',
}

export default function StatCard({ label, value, icon: Icon, accent = 'electric', sublabel }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border bg-surface transition-colors hover:bg-surface-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </CardTitle>
          <Icon size={16} className={cn(ACCENT_MAP[accent])} />
        </CardHeader>
        <CardContent>
          <motion.div
            key={String(value)}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-semibold tracking-tight"
          >
            {value}
          </motion.div>
          {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}