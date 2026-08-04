import { useState } from 'react'
import { usePacketSocket } from '../hooks/usePacketSocket'
import { api } from '../api/client'
import type { PacketEvent } from '../api/types'

function formatBytes(num: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = num
  for (const unit of units) {
    if (value < 1024) return `${value.toFixed(1)} ${unit}`
    value /= 1024
  }
  return `${value.toFixed(1)} TB`
}

export default function PacketsView() {
  const { packets, bandwidth, connected } = usePacketSocket()
  const [capturing, setCapturing] = useState(false)
  const [selected, setSelected] = useState<PacketEvent | null>(null)
  const [busy, setBusy] = useState(false)

  const latest = bandwidth[bandwidth.length - 1]

  async function toggleCapture() {
    setBusy(true)
    try {
      if (capturing) {
        await api.stopCapture()
        setCapturing(false)
      } else {
        await api.startCapture()
        setCapturing(true)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full gap-4 p-6">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-venom/30 bg-shadow p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleCapture}
              disabled={busy}
              className={`rounded px-4 py-2 text-sm font-semibold uppercase tracking-wide transition disabled:opacity-50 ${
                capturing
                  ? 'bg-blood text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:bg-red-700'
                  : 'bg-venom text-white shadow-[0_0_15px_rgba(124,58,237,0.6)] hover:bg-purple-700'
              }`}
            >
              {capturing ? 'Stop Capture' : 'Start Capture'}
            </button>
            <span className="flex items-center gap-2 text-xs text-neutral-400">
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              {connected ? 'Socket live' : 'Disconnected'}
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-blood">↓ In: {latest ? formatBytes(latest.bytes_in) : '0 B'}/s</span>
            <span className="text-venom">↑ Out: {latest ? formatBytes(latest.bytes_out) : '0 B'}/s</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-venom/30 bg-shadow">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-shadow text-neutral-500 uppercase">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Dir</th>
                <th className="p-2">Protocol</th>
                <th className="p-2">Source</th>
                <th className="p-2">Destination</th>
                <th className="p-2">Size</th>
              </tr>
            </thead>
            <tbody>
              {packets.map((p, i) => (
                <tr
                  key={`${p.timestamp}-${i}`}
                  onClick={() => setSelected(p)}
                  className="cursor-pointer border-t border-neutral-800 hover:bg-neutral-800/50"
                >
                  <td className="p-2 text-neutral-500">
                    {new Date(p.timestamp * 1000).toLocaleTimeString()}
                  </td>
                  <td className={`p-2 font-semibold ${p.direction === 'outbound' ? 'text-blood' : 'text-venom'}`}>
                    {p.direction === 'outbound' ? '↑ OUT' : '↓ IN'}
                  </td>
                  <td className="p-2">{p.protocol}</td>
                  <td className="p-2 text-neutral-300">
                    {p.src_ip}
                    {p.src_port ? `:${p.src_port}` : ''}
                  </td>
                  <td className="p-2 text-neutral-300">
                    {p.dst_ip}
                    {p.dst_port ? `:${p.dst_port}` : ''}
                  </td>
                  <td className="p-2 text-neutral-500">{p.length}B</td>
                </tr>
              ))}
              {packets.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-500">
                    {capturing ? 'Waiting for packets…' : 'Start capture to see live traffic'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-80 shrink-0 rounded-lg border border-blood/30 bg-shadow p-4">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-blood">Packet Detail</h2>
        {selected ? (
          <div className="space-y-2 text-sm">
            <DetailRow label="Timestamp" value={new Date(selected.timestamp * 1000).toLocaleString()} />
            <DetailRow label="Direction" value={selected.direction} />
            <DetailRow label="Protocol" value={selected.protocol} />
            <DetailRow label="Source IP" value={selected.src_ip} />
            <DetailRow label="Source Port" value={selected.src_port ?? '—'} />
            <DetailRow label="Destination IP" value={selected.dst_ip} />
            <DetailRow label="Destination Port" value={selected.dst_port ?? '—'} />
            <DetailRow label="Length" value={`${selected.length} bytes`} />
            <div className="mt-4 rounded bg-neutral-900 p-2 font-mono text-xs text-neutral-400">
              {selected.summary}
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Click a packet to inspect it</p>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-neutral-800 pb-1">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-100">{value}</span>
    </div>
  )
}