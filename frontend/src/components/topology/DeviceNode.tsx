import { Handle, Position } from 'reactflow'
import { Laptop2, Router, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DeviceNodeData {
  label: string
  sublabel: string
  kind: 'host' | 'gateway' | 'device' | 'internet'
}

const ICONS = {
  host: Laptop2,
  gateway: Router,
  device: Laptop2,
  internet: Globe,
}

const RING = {
  host: 'border-crimson shadow-[0_0_18px_rgba(239,68,68,0.35)]',
  gateway: 'border-cyan shadow-[0_0_14px_rgba(34,211,238,0.3)]',
  device: 'border-border',
  internet: 'border-muted-foreground',
}

export default function DeviceNode({ data }: { data: DeviceNodeData }) {
  const Icon = ICONS[data.kind]

  return (
    <div
      className={cn(
        'flex w-32 flex-col items-center gap-1 rounded-lg border-2 bg-surface px-3 py-2 text-center',
        RING[data.kind]
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-electric" />
      <Icon size={18} className={data.kind === 'host' ? 'text-crimson' : 'text-cyan'} />
      <span className="w-full truncate text-xs font-medium">{data.label}</span>
      <span className="w-full truncate text-[10px] text-muted-foreground">{data.sublabel}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-electric" />
    </div>
  )
}