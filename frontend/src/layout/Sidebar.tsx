import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Cpu,
  Network,
  Laptop2,
  Radio,
  BarChart3,
  Share2,
  ShieldAlert,
  Bell,
  ScrollText,
  Settings,
  BookOpen,
  Info,
  ChevronLeft,
} from 'lucide-react'
import { useUIStore } from '../store/ui-store'
import { cn } from '../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/system', label: 'System', icon: Cpu },
  { to: '/network', label: 'Network', icon: Network },
  { to: '/devices', label: 'Devices', icon: Laptop2 },
  { to: '/capture', label: 'Packet Capture', icon: Radio },
  { to: '/traffic', label: 'Traffic', icon: BarChart3 },
  { to: '/topology', label: 'Topology', icon: Share2 },
  { to: '/security', label: 'Security', icon: ShieldAlert },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/logs', label: 'Logs', icon: ScrollText },
]

const FOOTER_ITEMS = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/docs', label: 'Documentation', icon: BookOpen },
  { to: '/about', label: 'About', icon: Info },
]

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex h-screen shrink-0 flex-col border-r border-border bg-sidebar"
    >
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && (
          <span className="bg-gradient-to-r from-electric to-cyan bg-clip-text text-lg font-bold tracking-tight text-transparent">
            PULSE
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} className="block">
            <ChevronLeft size={16} />
          </motion.span>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border px-2 py-2">
        {FOOTER_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} collapsed={collapsed} />
        ))}
      </div>
    </motion.aside>
  )
}

function SidebarLink({
  to,
  label,
  icon: Icon,
  collapsed,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
        )
      }
    >
      <Icon size={18} />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}
