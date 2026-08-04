import { useEffect, useRef, useState } from 'react'
import type { SystemInfo, NetworkOverview } from '../api/types'

interface StatsMessage {
  type: 'stats'
  system: SystemInfo
  network: NetworkOverview
}

export function useStatsSocket() {
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [network, setNetwork] = useState<NetworkOverview | null>(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout>

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const socket = new WebSocket(`${protocol}://${window.location.host}/ws/stats`)
      socketRef.current = socket

      socket.onopen = () => {
        if (!cancelled) setConnected(true)
      }

      socket.onmessage = (event) => {
        const data: StatsMessage = JSON.parse(event.data)
        if (data.type === 'stats' && !cancelled) {
          setSystem(data.system)
          setNetwork(data.network)
        }
      }

      socket.onclose = () => {
        if (cancelled) return
        setConnected(false)
        reconnectTimer = setTimeout(connect, 2000)
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
      socketRef.current?.close()
    }
  }, [])

  return { system, network, connected }
}