import { useEffect, useRef, useState } from 'react'
import type { SecurityAlert } from '../api/types'
import { api } from '../api/client'

const MAX_ALERTS = 200

export function useAlertSocket() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    api.securityAlerts().then(setAlerts).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout>

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const socket = new WebSocket(`${protocol}://${window.location.host}/ws/alerts`)
      socketRef.current = socket

      socket.onopen = () => {
        if (!cancelled) setConnected(true)
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'alert') {
          setAlerts((prev) => [data as SecurityAlert, ...prev].slice(0, MAX_ALERTS))
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

  return { alerts, connected }
}