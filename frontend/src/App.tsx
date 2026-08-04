import { useState } from 'react'
import Dashboard from './components/Dashboard'
import PacketsView from './components/PacketsView'
import TopologyView from './components/TopologyView'
import { usePacketSocket } from './hooks/usePacketSocket'

type Tab = 'overview' | 'topology' | 'packets'

function App() {
  const [tab, setTab] = useState<Tab>('overview')
  const packetSocket = usePacketSocket()

  return (
    <div className="flex h-screen flex-col bg-void text-neutral-100">
      <header className="flex items-center justify-between border-b border-blood/30 bg-shadow px-6 py-4">
        <h1 className="bg-gradient-to-r from-blood to-venom bg-clip-text text-2xl font-bold text-transparent">
          PULSE
        </h1>
        <nav className="flex gap-1">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={tab === 'topology'} onClick={() => setTab('topology')}>
            Topology
          </TabButton>
          <TabButton active={tab === 'packets'} onClick={() => setTab('packets')}>
            Live Packets
          </TabButton>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div style={{ display: tab === 'overview' ? 'block' : 'none' }} className="h-full">
          <Dashboard />
        </div>
        <div style={{ display: tab === 'topology' ? 'block' : 'none' }} className="h-full">
          <TopologyView packetSocket={packetSocket} />
        </div>
        <div style={{ display: tab === 'packets' ? 'block' : 'none' }} className="h-full">
          <PacketsView packetSocket={packetSocket} />
        </div>
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-4 py-2 text-sm font-medium uppercase tracking-wide transition ${
        active ? 'bg-gradient-to-r from-blood to-venom text-white' : 'text-neutral-400 hover:text-neutral-100'
      }`}
    >
      {children}
    </button>
  )
}

export default App