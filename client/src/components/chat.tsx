import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
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
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(false)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState<string>("")
  const chat = chats.find(chat => chat.id === id);
  const [messages, setMessages] = React.useState<Message[]>(chat?.messages || []);

  const emailKey = "email";

  React.useEffect(() => {
    const parts = window.location.href.split("/");
    const chatId = parts[parts.length - 1];
    // add condition when chat list is empty to fetch from BE
    // const messages = fetchChatMessages(chatId);
    const messages = chats.find(chat => chat.id.toString() === chatId)?.messages;
    setMessages(messages || []);
  }, []);
  const { stop } = { stop: () => {
    stopGenerating()
    setIsLoading(false)
   } }
  async function reload() {
    setIsLoading(true)
    await regenerateMessage(messages, setMessages);
    setIsLoading(false)
  }
  
  const append = async (val: { content: string; role: string }) => {
    messages.push({ content: val.content, role: val.role, id: "34", liked:false, disliked: false })
    setMessages(messages)
    if (messages.length === 1 && val.role === "user") {
      const newChat: ChatType = {
        id: String(chats.length + 1),
        title: val.content,
        createdAt: new Date(),
        userId: sessionStorage.getItem(emailKey) || "",
        path: String(chats.length + 1),
        messages: []
      };
      setChats([...chats, newChat])
    }
    setIsLoading(true)
    await appendBotAnswer(val.content, setMessages);
    console.log("tu")
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

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
