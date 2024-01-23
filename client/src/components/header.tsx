import React from 'react'
import { SidebarMobile } from './sidebar-mobile'
import { ChatHistory } from './chat-history'
import Logo from "@/assets/logo.svg";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <SidebarMobile>
            <ChatHistory />
          </SidebarMobile>
        </React.Suspense>
      </div>
      <a href="https://www.lambdaworks.io/" target='__blank'>
        <img src={Logo} />
      </a>
    </header>
  )
}
