import { Card, CardContent } from '../components/ui/card'

export default function About() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="text-center">
        <h1 className="bg-gradient-to-r from-electric to-cyan bg-clip-text text-3xl font-bold text-transparent">
          PULSE
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Open-source network observability platform</p>
      </div>

      <Card className="border-border bg-surface">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p>
            Pulse turns live network and system activity into a visual, interactive dashboard — built
            to make how networks actually work visible, not just tables of numbers.
          </p>
          <p className="mt-3">
            Built with FastAPI, Scapy, React, and real captured data at every layer — no simulated
            metrics, no guessed classifications.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}