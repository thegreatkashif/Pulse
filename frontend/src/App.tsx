import { Routes, Route } from 'react-router-dom'
import AppShell from './layout/AppShell'
import Placeholder from './pages/Placeholder'
import { useApplyTheme } from './hooks/use-apply-theme'
import Dashboard from './pages/Dashboard'
import Topology from './pages/Topology'
import PacketCapture from './pages/PacketCapture'

function App() {
  useApplyTheme()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/system" element={<Placeholder title="System" />} />
        <Route path="/network" element={<Placeholder title="Network" />} />
        <Route path="/devices" element={<Placeholder title="Devices" />} />
       <Route path="/capture" element={<PacketCapture />} />
        <Route path="/traffic" element={<Placeholder title="Traffic" />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/security" element={<Placeholder title="Security" />} />
        <Route path="/alerts" element={<Placeholder title="Alerts" />} />
        <Route path="/logs" element={<Placeholder title="Logs" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="/docs" element={<Placeholder title="Documentation" />} />
        <Route path="/about" element={<Placeholder title="About" />} />
      </Route>
    </Routes>
  )
}

export default App