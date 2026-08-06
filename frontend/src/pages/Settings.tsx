import { Sun, Moon, Monitor } from 'lucide-react'
import { useUIStore } from '../store/ui-store'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function Settings() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

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

      <Card className="border-border bg-surface opacity-60">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Capture Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not implemented yet — capture window size, interface selection, and alert thresholds will live here.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-surface opacity-60">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Data Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not implemented yet — controls for how long DNS logs and alerts are kept in the database.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}