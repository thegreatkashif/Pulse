import { create } from 'zustand'

type Theme = 'dark' | 'light' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  theme: (localStorage.getItem('pulse-theme') as Theme) ?? 'dark',
  setTheme: (theme) => {
    localStorage.setItem('pulse-theme', theme)
    set({ theme })
  },
}))