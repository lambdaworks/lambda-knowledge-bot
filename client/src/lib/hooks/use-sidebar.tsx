import React from 'react'

const sidebarKey: LocalStorageKey = "sidebar";

interface SidebarContext {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  isLoading: boolean
}

const SidebarContext = React.createContext<SidebarContext | undefined>(
  undefined
)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true)
  const [isLoading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const value = localStorage.getItem(sidebarKey)
    if (value) {
      setSidebarOpen(JSON.parse(value))
    }
    setLoading(false)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(value => {
      const newState = !value
      localStorage.setItem(sidebarKey, JSON.stringify(newState))
      return newState
    })
  }

  if (isLoading) {
    return null
  }

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, isLoading }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
