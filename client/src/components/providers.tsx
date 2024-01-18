import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }: { children: JSX.Element }) {
  return (
    <SidebarProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarProvider>
  )
}
