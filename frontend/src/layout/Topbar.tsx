import { Bell, Search, Sun, Moon, Monitor, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Badge } from '../components/ui/badge'
import { useUIStore } from '../store/ui-store'

export default function Topbar() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const setMobileOpen = useUIStore((s) => s.setMobileOpen)

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur">
      <button
        onClick={() => setMobileOpen(true)}
        className="mr-2 rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full rounded-md border border-border bg-secondary/50 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-electric"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden gap-1.5 border-emerald/40 text-emerald sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          System healthy
        </Badge>

        <button className="relative rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
          <Bell size={17} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <ThemeIcon size={17} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun size={14} className="mr-2" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon size={14} className="mr-2" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor size={14} className="mr-2" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}