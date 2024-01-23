import React from 'react'
import { SidebarMobile } from './sidebar-mobile'
import { ChatHistory } from './chat-history'
import { Chat } from '@/lib/types';
import Logo from '../assets/knowle-dark-bckrnd.svg'

export function Header() {
  const chats: Chat[] = [];
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <span>Knowλe</span>
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <SidebarMobile>
            <ChatHistory />
          </SidebarMobile>
        </React.Suspense>
      </div>
      <a target='__blank' className="logo-container">
        <img src={Logo} alt='Logo'></img>
      </a>
    </header>
  )
}
