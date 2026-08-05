import { useEffect, useRef, useState } from 'react'
import type { PacketEvent, BandwidthSample, TopologyEvidence } from '../api/types'

const MAX_PACKETS = 300
const MAX_BANDWIDTH_SAMPLES = 60

export function usePacketSocket() {
  const [packets, setPackets] = useState<PacketEvent[]>([])
  const [bandwidth, setBandwidth] = useState<BandwidthSample[]>([])
  const [topology, setTopology] = useState<TopologyEvidence | null>(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout>

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const socket = new WebSocket(`${protocol}://${window.location.host}/ws/packets`)
      socketRef.current = socket

      socket.onopen = () => {
        if (!cancelled) setConnected(true)
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'packet') {
          setPackets((prev) => [data as PacketEvent, ...prev].slice(0, MAX_PACKETS))
        } else if (data.type === 'bandwidth') {
          setBandwidth((prev) => [...prev, data as BandwidthSample].slice(-MAX_BANDWIDTH_SAMPLES))
        } else if (data.type === 'topology') {
          setTopology(data as TopologyEvidence)
        }
      }

      socket.onclose = () => {
        if (cancelled) return
        setConnected(false)
        reconnectTimer = setTimeout(connect, 2000)
      }

      socket.onerror = () => socket.close()
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
      socketRef.current?.close()
    }
  }, [])

  return { packets, bandwidth, topology, connected }
}

export type PacketSocketState = ReturnType<typeof usePacketSocket>