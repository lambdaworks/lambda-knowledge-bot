import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI, IconThumbsDown, IconThumbsUp, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { Message } from '@/lib/types'
import { Button } from './ui/button'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Tooltip } from './ui/tooltip'
import { handleDislikeMessage, handleLikeMessage } from '@/api/api'
import { useState } from 'react'

export interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const [liked, setLiked] = useState(message.liked);
  const [disliked, setDisliked] = useState(message.disliked);

  function likeMessage() {
    handleLikeMessage()
    setLiked(!liked)
    if (!liked)
      setDisliked(false)
  }

  function dislikeMessage() {
    handleDislikeMessage()
    setDisliked(!disliked)
    if (!disliked)
      setLiked(false)
  }

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
          className="break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
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
        {message.role === 'bot' && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-5 h-5 p-0 ${liked ? 'bg-light-background' : 'bg-background'}`}
                  style={{ marginRight: '5px' }}
                  onClick={likeMessage}
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
                  className={`w-5 h-5 p-0 ${disliked ? 'bg-light-background' : 'bg-background'}`}
                  onClick={dislikeMessage}
                >
                  <IconThumbsDown />
                  <span className="sr-only">Dislike</span>
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  )
}
