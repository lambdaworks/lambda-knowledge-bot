import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import "@/index.css"

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
        )}
      >
        <Toaster />
        <Providers>
          <>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
            </div>
            {/* <TailwindIndicator /> */}
          </>
        </Providers>
      </body>
    </html>
  )
}
