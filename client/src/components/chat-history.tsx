import { cn } from '@/lib/utils'
import { SidebarList } from '@/components/sidebar-list'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { ChatType } from '@/lib/types'
import React from 'react'

interface ChatHistoryProps {
  chats: ChatType[]
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

export function ChatHistory({chats = [], setChats}: ChatHistoryProps) {
  const handleNewChatClick = () => {
    window.location.href = window.location.origin
  };
  return (
    <div className="flex flex-col h-full">
      <div className="px-2 my-4">
        <a
          onClick={handleNewChatClick}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'text-black h-10 w-full justify-start bg-zinc-50 px-4 shadow-none hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
          )}
        >
          <IconPlus className="-translate-x-2 stroke-2" />
          New Chat
        </a>
      </div>
      <React.Suspense
        fallback={
          <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        }
      >
        <SidebarList chats={chats} setChats={setChats}/>
      </React.Suspense>
    </div>
  )
}
