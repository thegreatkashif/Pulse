import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useAlertSocket } from '../hooks/useAlertSocket'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-crimson',
  warning: 'bg-amber',
  info: 'bg-muted-foreground',
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'border-crimson text-crimson',
  warning: 'border-amber text-amber',
  info: 'border-muted-foreground text-muted-foreground',
}

export default function Alerts() {
  const { alerts } = useAlertSocket()
  const [query, setQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (severityFilter && a.severity !== severityFilter) return false
      if (query && !a.message.toLowerCase().includes(query.toLowerCase()) && !a.category.includes(query.toLowerCase())) {
        return false
      }
      return true
    })
  }, [alerts, query, severityFilter])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground">Full alert history, searchable</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alerts…"
            className="w-full rounded-md border border-border bg-secondary/50 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-electric"
          />
        </div>
        {['critical', 'warning', 'info'].map((sev) => (
          <button key={sev} onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}>
            <Badge
              variant="outline"
              className={`cursor-pointer capitalize ${severityFilter === sev ? SEVERITY_LABEL[sev] : 'border-border text-muted-foreground'}`}
            >
              {sev}
            </Badge>
          </button>
        ))}
      </div>

      <Card className="border-border bg-surface">
        <CardContent className="pt-6">
          <div className="relative space-y-4 border-l border-border pl-6">
            {filtered.map((alert, i) => (
              <motion.div
                key={`${alert.timestamp}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <span
                  className={`absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full ${SEVERITY_DOT[alert.severity]}`}
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(alert.timestamp * 1000).toLocaleString()}</span>
                  <Badge variant="outline" className={`capitalize ${SEVERITY_LABEL[alert.severity]}`}>
                    {alert.category.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="mt-1 text-sm">{alert.message}</p>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="py-6 text-sm text-muted-foreground">No alerts match your filters.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}