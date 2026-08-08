import { Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import { useApplyTheme } from './hooks/use-apply-theme'
import Dashboard from './pages/Dashboard'
import Topology from './pages/Topology'
import PacketCapture from './pages/PacketCapture'
import Security from './pages/Security'
import Alerts from './pages/Alerts'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'
import System from './pages/System'
import Network from './pages/Network'
import Traffic from './pages/Traffic'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import Documentation from './pages/Documentation'
import About from './pages/About'

function App() {
  useApplyTheme()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/system" element={<System />} />
        <Route path="/network" element={<Network />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/capture" element={<PacketCapture />} />
        <Route path="/traffic" element={<Traffic />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/security" element={<Security />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/about" element={<About />} />
        <Route path="/devices/:ip" element={<DeviceDetail />} />
      </Route>
    </Routes>
  )
}

export default App