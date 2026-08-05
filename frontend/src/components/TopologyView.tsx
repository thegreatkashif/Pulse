import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api/client'
import type { NetworkDevice, NetworkOverview } from '../api/types'
import type { PacketSocketState } from '../hooks/usePacketSocket'

interface Pulse {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

interface NodePos {
  key: string
  label: string
  sublabel: string
  x: number
  y: number
  isGateway: boolean
}

const WIDTH = 800
const HEIGHT = 480
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 + 30 }
const INTERNET_POS = { x: WIDTH / 2, y: 50 }
const RADIUS = 170

export default function TopologyView({ packetSocket }: { packetSocket: PacketSocketState }) {
  const { packets, bandwidth, topology } = packetSocket
  const [devices, setDevices] = useState<NetworkDevice[]>([])
  const [network, setNetwork] = useState<NetworkOverview | null>(null)
  const [pulses, setPulses] = useState<Pulse[]>([])
  const lastSeenTimestamp = useRef<number | null>(null)

  useEffect(() => {
    api.devices().then(setDevices).catch(() => {})
    api.network().then(setNetwork).catch(() => {})
  }, [])

  // Build node positions: host in center, devices in a circle, internet above
  const nodes: NodePos[] = devices.map((d, i) => {
    const angle = (i / Math.max(devices.length, 1)) * 2 * Math.PI - Math.PI / 2
    return {
      key: d.ip,
      label: d.hostname ?? d.ip,
      sublabel: d.ip,
      x: CENTER.x + RADIUS * Math.cos(angle),
      y: CENTER.y + RADIUS * Math.sin(angle),
      isGateway: d.ip === network?.default_gateway,
    }
  })

  // Turn each new packet into a pulse animation on the right spoke
  useEffect(() => {
    const latest = packets[0]
    if (!latest || latest.timestamp === lastSeenTimestamp.current) return
    lastSeenTimestamp.current = latest.timestamp

    const remoteIp = latest.direction === 'outbound' ? latest.dst_ip : latest.src_ip
    const matched = nodes.find((n) => n.key === remoteIp)
    const target = matched ?? { x: INTERNET_POS.x, y: INTERNET_POS.y }

    const [from, to] =
      latest.direction === 'outbound' ? [CENTER, target] : [target, CENTER]

    const pulse: Pulse = {
      id: `${latest.timestamp}-${Math.random()}`,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      color: latest.direction === 'outbound' ? 'var(--color-blood)' : 'var(--color-venom)',
    }

    setPulses((prev) => [...prev.slice(-40), pulse])

    const timer = setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== pulse.id))
    }, 900)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packets])

  const bwData = bandwidth.map((b) => ({
    time: new Date(b.timestamp * 1000).toLocaleTimeString(),
    in: b.bytes_in,
    out: b.bytes_out,
  }))

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="rounded-lg border border-venom/30 bg-shadow p-3 text-sm text-neutral-400">
        {topology ? (
          <>
            Topology:{' '}
            <span className="font-semibold text-venom uppercase">{topology.classification}</span>
            {topology.gateway_ip && (
              <span className="text-neutral-500"> · gateway {topology.gateway_ip}</span>
            )}
            <p className="mt-1 text-xs text-neutral-500">{topology.explanation}</p>
            <p className="mt-1 text-xs text-neutral-600">
              Evidence: {topology.gateway_relayed_frames} frame(s) relayed via gateway MAC ·{' '}
              {topology.local_direct_frames} frame(s) sent direct to local device MACs
            </p>
          </>
        ) : (
          <>
            Topology: <span className="text-neutral-500">not yet measured</span>
            <p className="mt-1 text-xs text-neutral-500">
              Go to Live Packets and start capture — classification appears once real traffic
              evidence comes in.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 rounded-lg border border-blood/30 bg-shadow">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full">
            {/* static spokes */}
            <line
              x1={CENTER.x}
              y1={CENTER.y}
              x2={INTERNET_POS.x}
              y2={INTERNET_POS.y}
              stroke="#3f3f46"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            {nodes.map((n) => (
              <line
                key={`edge-${n.key}`}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={n.x}
                y2={n.y}
                stroke={n.isGateway ? 'var(--color-venom)' : '#3f3f46'}
                strokeOpacity={n.isGateway ? 0.5 : 0.3}
                strokeWidth={1.5}
              />
            ))}

            {/* animated pulses */}
            {pulses.map((p) => (
              <circle key={p.id} r={5} fill={p.color} style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}>
                <animate attributeName="cx" from={p.x1} to={p.x2} dur="0.9s" fill="freeze" />
                <animate attributeName="cy" from={p.y1} to={p.y2} dur="0.9s" fill="freeze" />
                <animate attributeName="opacity" from={1} to={0} dur="0.9s" fill="freeze" />
              </circle>
            ))}

            {/* internet node */}
            <g>
              <circle cx={INTERNET_POS.x} cy={INTERNET_POS.y} r={26} fill="var(--color-shadow)" stroke="#3f3f46" strokeWidth={2} />
              <text x={INTERNET_POS.x} y={INTERNET_POS.y + 4} textAnchor="middle" fontSize={10} fill="#a1a1aa">
                🌐
              </text>
              <text x={INTERNET_POS.x} y={INTERNET_POS.y + 42} textAnchor="middle" fontSize={11} fill="#71717a">
                Internet
              </text>
            </g>

            {/* device nodes */}
            {nodes.map((n) => (
              <g key={n.key}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={22}
                  fill="var(--color-shadow)"
                  stroke={n.isGateway ? 'var(--color-venom)' : '#52525b'}
                  strokeWidth={2}
                />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={10} fill="#e4e4e7">
                  {n.isGateway ? '🛡' : '💻'}
                </text>
                <text x={n.x} y={n.y + 38} textAnchor="middle" fontSize={10} fill="#a1a1aa">
                  {n.label.length > 14 ? n.label.slice(0, 14) + '…' : n.label}
                </text>
                <text x={n.x} y={n.y + 50} textAnchor="middle" fontSize={9} fill="#71717a">
                  {n.sublabel}
                </text>
              </g>
            ))}

            {/* host node, center */}
            <g>
              <circle
                cx={CENTER.x}
                cy={CENTER.y}
                r={34}
                fill="var(--color-shadow)"
                stroke="var(--color-blood)"
                strokeWidth={3}
                style={{ filter: 'drop-shadow(0 0 10px rgba(220,38,38,0.5))' }}
              />
              <text x={CENTER.x} y={CENTER.y + 5} textAnchor="middle" fontSize={13} fill="#fff">
                YOU
              </text>
            </g>
          </svg>
        </div>

        <div className="w-80 shrink-0 rounded-lg border border-venom/30 bg-shadow p-4">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-venom">
            Bandwidth (per second)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bwData}>
              <XAxis dataKey="time" hide />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip
                contentStyle={{ background: '#150a1f', border: '1px solid #3f3f46', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="in" stroke="var(--color-venom)" dot={false} strokeWidth={2} name="In" />
              <Line type="monotone" dataKey="out" stroke="var(--color-blood)" dot={false} strokeWidth={2} name="Out" />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-4 text-xs text-neutral-500">
            Go to <span className="text-blood">Live Packets</span> and click{' '}
            <span className="text-venom">Start Capture</span>, then browse or download something —
            you'll see pulses fly across the graph and this chart climb in real time.
          </p>
        </div>
      </div>
    </div>
  )
}