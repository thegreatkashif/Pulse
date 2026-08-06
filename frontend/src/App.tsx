import { Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import Placeholder from './pages/Placeholder'
import { useApplyTheme } from './hooks/use-apply-theme'
import Dashboard from './pages/Dashboard'
import Topology from './pages/Topology'
import PacketCapture from './pages/PacketCapture'
import Security from './pages/Security'
import Alerts from './pages/Alerts'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'
function App() {
  useApplyTheme()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/system" element={<Placeholder title="System" />} />
        <Route path="/network" element={<Placeholder title="Network" />} />
        <Route path="/devices" element={<Devices />} />
       <Route path="/capture" element={<PacketCapture />} />
        <Route path="/traffic" element={<Placeholder title="Traffic" />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/security" element={<Security />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/logs" element={<Placeholder title="Logs" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="/docs" element={<Placeholder title="Documentation" />} />
        <Route path="/about" element={<Placeholder title="About" />} />
        <Route path="/devices/:ip" element={<DeviceDetail />} />
      </Route>
    </Routes>
  )
}

export default App