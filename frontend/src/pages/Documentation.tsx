import { Card, CardContent } from '../components/ui/card'

export default function Documentation() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Documentation</h1>
        <p className="text-sm text-muted-foreground">How Pulse works, and what's real vs. planned</p>
      </div>

      <Card className="border-border bg-surface">
        <CardContent className="prose prose-invert prose-sm max-w-none pt-6">
          <h2 className="text-base font-semibold">Capture scope</h2>
          <p className="text-muted-foreground">
            Pulse captures traffic to and from this host only. It does not intercept other devices'
            traffic — that would require a mirrored switch port or ARP spoofing, neither of which
            Pulse does, by design.
          </p>

          <h2 className="mt-4 text-base font-semibold">Topology classification</h2>
          <p className="text-muted-foreground">
            The topology view doesn't guess. It classifies your network as star/hub-and-spoke only
            after observing real evidence: outbound frames to destinations outside your subnet
            addressed at the link layer to your gateway's MAC address.
          </p>

          <h2 className="mt-4 text-base font-semibold">Security detection</h2>
          <p className="text-muted-foreground">
            Port scan, ARP spoofing, and traffic spike detection all run against captured packets in
            real time, tuned to avoid false positives from normal browsing.
          </p>

          <h2 className="mt-4 text-base font-semibold">Known limitations</h2>
          <ul className="text-muted-foreground">
            <li>Windows + Npcap + Administrator privileges required for capture</li>
            <li>Disk usage and temperature aren't wired up yet</li>
            <li>Traffic analytics reflect the current session only — no long-term history yet</li>
            <li>No per-device vendor lookup or OS fingerprinting yet</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}