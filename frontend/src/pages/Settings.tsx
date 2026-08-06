import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Save, Trash2 } from 'lucide-react'
import { useUIStore } from '../store/ui-store'
import { api } from '../api/client'
import type { CapturePreferences, NetworkInterface, RetentionSettings } from '../api/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'

export default function Settings() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const [prefs, setPrefs] = useState<CapturePreferences | null>(null)
  const [retention, setRetention] = useState<RetentionSettings | null>(null)
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([])
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingRetention, setSavingRetention] = useState(false)
  const [pruning, setPruning] = useState(false)
  const [pruneResult, setPruneResult] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  useEffect(() => {
    api.getCapturePreferences().then(setPrefs).catch(() => {})
    api.getRetentionSettings().then(setRetention).catch(() => {})
    api.interfaces().then(setInterfaces).catch(() => {})
  }, [])

  async function savePrefs() {
    if (!prefs) return
    setSavingPrefs(true)
    try {
      const saved = await api.saveCapturePreferences(prefs)
      setPrefs(saved)
      setSavedMsg('Capture preferences saved')
      setTimeout(() => setSavedMsg(null), 2000)
    } finally {
      setSavingPrefs(false)
    }
  }

  async function saveRetention() {
    if (!retention) return
    setSavingRetention(true)
    try {
      const saved = await api.saveRetentionSettings(retention)
      setRetention(saved)
      setSavedMsg('Retention settings saved')
      setTimeout(() => setSavedMsg(null), 2000)
    } finally {
      setSavingRetention(false)
    }
  }

  async function pruneNow() {
    setPruning(true)
    setPruneResult(null)
    try {
      const res = await fetch('/api/settings/retention/prune', { method: 'POST' })
      const data = await res.json()
      setPruneResult(
        `Deleted ${data.dns_deleted} DNS log(s), ${data.alerts_deleted} alert(s), ${data.bandwidth_deleted} bandwidth sample(s)`
      )
    } finally {
      setPruning(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure Pulse</p>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}>
              <Sun size={14} /> Light
            </Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
              <Moon size={14} /> Dark
            </Button>
            <Button variant={theme === 'system' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('system')}>
              <Monitor size={14} /> System
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Capture Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!prefs ? (
            <Skeleton className="h-64 rounded-md" />
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Capture Interface</label>
                <select
                  value={prefs.interface ?? ''}
                  onChange={(e) => setPrefs({ ...prefs, interface: e.target.value || null })}
                  className="w-full rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-sm outline-none focus:border-electric"
                >
                  <option value="">Auto-detect (default)</option>
                  {interfaces.filter((i) => i.is_up).map((i) => (
                    <option key={i.name} value={i.name}>
                      {i.name} {i.ipv4[0] ? `(${i.ipv4[0]})` : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">Takes effect the next time you start capture.</p>
              </div>

              <Field
                label="Port scan threshold (distinct ports)"
                value={prefs.port_scan_threshold}
                onChange={(v) => setPrefs({ ...prefs, port_scan_threshold: v })}
              />
              <Field
                label="Port scan window (seconds)"
                value={prefs.port_scan_window}
                onChange={(v) => setPrefs({ ...prefs, port_scan_window: v })}
              />
              <Field
                label="Traffic spike multiplier (x baseline)"
                value={prefs.spike_multiplier}
                onChange={(v) => setPrefs({ ...prefs, spike_multiplier: v })}
              />
              <Field
                label="Minimum baseline for spike detection (bytes/s)"
                value={prefs.spike_min_baseline}
                onChange={(v) => setPrefs({ ...prefs, spike_min_baseline: v })}
              />
              <Field
                label="Spike sustain samples (consecutive seconds)"
                value={prefs.spike_sustain_samples}
                onChange={(v) => setPrefs({ ...prefs, spike_sustain_samples: v })}
              />
              <Field
                label="Spike alert cooldown (seconds)"
                value={prefs.spike_cooldown}
                onChange={(v) => setPrefs({ ...prefs, spike_cooldown: v })}
              />

              <Button onClick={savePrefs} disabled={savingPrefs} size="sm" className="bg-electric hover:bg-electric/90">
                <Save size={14} /> {savingPrefs ? 'Saving…' : 'Save Preferences'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!retention ? (
            <Skeleton className="h-24 rounded-md" />
          ) : (
            <>
              <Field
                label="Keep DNS logs, alerts, and bandwidth history for (days)"
                value={retention.retention_days}
                onChange={(v) => setRetention({ retention_days: v })}
              />
              <p className="text-xs text-muted-foreground">
                Older records are automatically pruned once a day in the background, or you can prune manually now.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={saveRetention} disabled={savingRetention} size="sm" className="bg-electric hover:bg-electric/90">
                  <Save size={14} /> {savingRetention ? 'Saving…' : 'Save'}
                </Button>
                <Button onClick={pruneNow} disabled={pruning} size="sm" variant="destructive">
                  <Trash2 size={14} /> {pruning ? 'Pruning…' : 'Prune Now'}
                </Button>
              </div>
              {pruneResult && <p className="text-xs text-emerald">{pruneResult}</p>}
            </>
          )}
        </CardContent>
      </Card>

      {savedMsg && (
        <div className="fixed bottom-4 right-4 rounded-md border border-emerald bg-surface px-4 py-2 text-sm text-emerald shadow-lg">
          {savedMsg}
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-secondary/50"
      />
    </div>
  )
}