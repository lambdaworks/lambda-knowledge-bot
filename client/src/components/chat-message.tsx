import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { Message } from '@/lib/types'
import { IconThumbsUp, IconThumbsDown } from '@/components/ui/icons'; // Adjust with actual icon imports
import { handleDislikeMessage, handleLikeMessage } from '@/api/chat.service'
import { Tooltip, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Button } from './ui/button'
import { useState } from 'react'

export interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const [liked, setLiked] = useState(message.liked);
  const [disliked, setDisliked] = useState(message.disliked);
  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 text-user-color"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 cursor-default animate-pulse">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
        {message.role === "bot" && (
          <div className="flex space-x-2 pt-2 hover:text-white">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-5 h-5 p-0 text-white ${liked ? 'bg-light-background' : 'bg-transparent'
                    }`}
                  disabled={false}
                  onClick={() => {
                    setLiked(!liked)
                    if (!liked) setDisliked(false)
                    handleLikeMessage()
                  }}
                >
                  <IconThumbsUp />
                  <span className="sr-only">Like</span>
                </Button>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-5 h-5 p-0 text-white ${disliked ? 'bg-light-background' : 'bg-transparent'}`}
                  disabled={false}
                  onClick={()=>{
                    setDisliked(!disliked)
                    if (!disliked) setLiked(false)
                    handleDislikeMessage()
                  }}
                >
                  <IconThumbsDown />
                  <span className="sr-only">Dislike</span>
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
