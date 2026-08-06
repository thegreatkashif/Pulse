import { useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { api } from '../api/client'
import { usePacketSocket } from '../hooks/usePacketSocket'
import type { NetworkDevice, NetworkOverview } from '../api/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import DeviceNode from '../components/topology/DeviceNode'

const nodeTypes = { device: DeviceNode }

export default function Topology() {
  const { topology } = usePacketSocket()
  const [devices, setDevices] = useState<NetworkDevice[]>([])
  const [network, setNetwork] = useState<NetworkOverview | null>(null)

  useEffect(() => {
    api.devices().then(setDevices).catch(() => {})
    api.network().then(setNetwork).catch(() => {})
  }, [])

  const { nodes, edges } = useMemo(() => {
    const centerX = 400
    const centerY = 300
    const radius = 220

    const nodes: Node[] = [
      {
        id: 'host',
        type: 'device',
        position: { x: centerX, y: centerY },
        data: { label: 'YOU', sublabel: 'This machine', kind: 'host' },
      },
      {
        id: 'internet',
        type: 'device',
        position: { x: centerX, y: centerY - radius - 100 },
        data: { label: 'Internet', sublabel: 'Outside network', kind: 'internet' },
      },
    ]

    const edges: Edge[] = [
      {
        id: 'e-host-internet',
        source: 'host',
        target: 'internet',
        style: { strokeDasharray: '4 4', stroke: 'var(--color-muted-foreground)' },
      },
    ]

    devices.forEach((d, i) => {
      const angle = (i / Math.max(devices.length, 1)) * 2 * Math.PI - Math.PI / 2
      const isGateway = d.ip === network?.default_gateway

      nodes.push({
        id: d.ip,
        type: 'device',
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
        data: {
          label: d.hostname ?? d.ip,
          sublabel: d.ip,
          kind: isGateway ? 'gateway' : 'device',
        },
      })

      edges.push({
        id: `e-host-${d.ip}`,
        source: 'host',
        target: d.ip,
        style: { stroke: isGateway ? 'var(--color-cyan)' : 'var(--color-border)' },
        markerEnd: { type: MarkerType.ArrowClosed },
      })
    })

    return { nodes, edges }
  }, [devices, network])

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col gap-4 md:h-[calc(100vh-7rem)]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Topology</h1>
        <p className="text-sm text-muted-foreground">Live-inferred network layout from ARP + captured frame evidence</p>
      </div>

      <Card className="border-border bg-surface shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-medium">
            Classification
            {topology && (
              <Badge variant="outline" className="border-cyan text-cyan uppercase">
                {topology.classification}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {topology?.explanation ?? 'Start capture on the Packet Capture tab to begin gathering evidence.'}
          </p>
          {topology && (
            <p className="mt-2 text-xs text-muted-foreground">
              Evidence: {topology.gateway_relayed_frames} frame(s) via gateway MAC ·{' '}
              {topology.local_direct_frames} frame(s) direct to local MACs
            </p>
          )}
        </CardContent>
      </Card>

      <div className="min-h-0 flex-1 rounded-lg border border-border bg-surface">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--color-border)" gap={24} />
          <Controls className="!bg-surface [&>button]:!border-border [&>button]:!bg-surface [&>button]:!text-foreground" />
        </ReactFlow>
      </div>
    </div>
  )
}