import { create } from 'zustand'

type Theme = 'dark' | 'light' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  mobileOpen: false,
  setMobileOpen: (open) => set({ mobileOpen: open }),
  theme: (localStorage.getItem('pulse-theme') as Theme) ?? 'dark',
  setTheme: (theme) => {
    localStorage.setItem('pulse-theme', theme)
    set({ theme })
  },
}))