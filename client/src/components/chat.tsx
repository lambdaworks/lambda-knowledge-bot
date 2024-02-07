import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useState } from 'react'
import { ChatType, Message } from '@/lib/types'
import React from 'react'
import { appendBotAnswer, regenerateMessage, stopGenerating } from '@/api/api'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  chats: ChatType[]
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

export function Chat({ id, className, chats = [], setChats }: ChatProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState<string>("")
  let chat: ChatType | undefined = chats.find(chat => chat.id === id);
  const [messages, setMessages] = React.useState<Message[]>(chat?.messages || []);

  React.useEffect(() => {
    const parts = window.location.href.split("/");
    const chatId = parts[parts.length - 1];
    // add condition when chat list is empty to fetch from BE
    // const messages = fetchChatMessages(chatId);
    const messages = chats.find(chat => chat.id.toString() === chatId)?.messages;
    setMessages(messages || []);
  }, []);
  const stop = (): void => {
    stopGenerating();
    setIsLoading(false);
  }
  async function reload() {
    setIsLoading(true)
    await regenerateMessage(chat?.id, messages, setMessages);
    setIsLoading(false)
  }

  const append = async (val: { content: string; role: string }) => {
    messages.push({ content: val.content, role: val.role, id: "34", liked: false, disliked: false })
    setMessages(messages)
    if (messages.length === 1 && val.role === "user") {
      const newChat: ChatType = {
        id: String(chats.length + 1),
        title: val.content,
        createdAt: new Date(),
        messages: []
      };
      chat = newChat;
      setChats([...chats, newChat])
    }
    setIsLoading(true)
    await appendBotAnswer(chat?.id, val.content, setMessages);
    setIsLoading(false)
  };

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        title="title"
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  )
}
