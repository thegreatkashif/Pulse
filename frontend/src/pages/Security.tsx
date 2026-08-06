import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ShieldCheck, Radar } from 'lucide-react'
import { useAlertSocket } from '../hooks/useAlertSocket'
import { api } from '../api/client'
import type { DnsQuery } from '../api/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'

const CATEGORY_LABELS: Record<string, string> = {
  port_scan: 'Port Scan',
  arp_spoof: 'ARP Spoofing',
  traffic_spike: 'Traffic Spike',
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-crimson/40 bg-crimson/10 text-crimson',
  warning: 'border-amber/40 bg-amber/10 text-amber',
  info: 'border-border bg-muted text-muted-foreground',
}

export default function Security() {
  const { alerts, connected } = useAlertSocket()
  const [dns, setDns] = useState<DnsQuery[]>([])

  useEffect(() => {
    api.dnsRecent().then(setDns).catch(() => {})
  }, [])

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const warningCount = alerts.filter((a) => a.severity === 'warning').length
  const isClean = alerts.length === 0

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Security</h1>
          <p className="text-sm text-muted-foreground">Real-time anomaly detection on captured traffic</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald' : 'bg-crimson'}`} />
          {connected ? 'Live' : 'Reconnecting…'}
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-4">
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 pt-6">
            <ShieldAlert size={20} className="text-crimson" />
            <div>
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-lg font-semibold">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 pt-6">
            <Radar size={20} className="text-amber" />
            <div>
              <p className="text-xs text-muted-foreground">Warnings</p>
              <p className="text-lg font-semibold">{warningCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 pt-6">
            <ShieldCheck size={20} className={isClean ? 'text-emerald' : 'text-muted-foreground'} />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">{isClean ? 'Clean' : 'Active alerts'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-h-0 border-border bg-surface lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Threat Feed</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-3.5rem)] p-0">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {alerts.map((alert, i) => (
                    <motion.div
                      key={`${alert.timestamp}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-md border p-3 text-sm ${SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info}`}
                    >
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-xs uppercase tracking-wide">
                        <span className="font-semibold">{CATEGORY_LABELS[alert.category] ?? alert.category}</span>
                        <span className="text-muted-foreground">
                          {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-foreground/90">{alert.message}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {alerts.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No alerts. Start capture on Packet Capture to begin monitoring.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="min-h-0 border-border bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">DNS Lookups</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-3.5rem)] p-0">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-2 text-xs">
                {dns.length === 0 && <p className="text-muted-foreground">No DNS activity captured yet.</p>}
                {dns.map((entry) => (
                  <div key={entry.id} className="border-b border-border/50 pb-2">
                    <div className="flex justify-between gap-2">
                      <span className="truncate">{entry.domain}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {new Date(entry.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                    {entry.resolved_ips && <p className="text-muted-foreground">{entry.resolved_ips}</p>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}