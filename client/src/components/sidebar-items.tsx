

import { Chat } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { useState } from 'react'
import { removeChat } from '@/api/chat.service'

interface SidebarItemsProps {
  chats?: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export function SidebarItems({ chats, setChats }: SidebarItemsProps) {

  if (!chats?.length) return null

  return (
    <AnimatePresence>
      {chats.map(
        (chat, index) =>
          chat && (
            <motion.div
              key={chat?.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <SidebarItem index={index} chat={chat}>
                <SidebarActions
                  chat={chat}
                  removeChat={() => {
                    const updatedChats = chats?.filter((currentChat) => chat.id !== currentChat.id);
                    removeChat(chat.id)
                    setChats(updatedChats)
                  }}
                  shareChat={() => {
                    console.log("SHARE CHAT")
                  }}
                />
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}
