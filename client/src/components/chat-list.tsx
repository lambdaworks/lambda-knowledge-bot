import { useEffect, useRef } from "react";

import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";
import { Message } from "@/lib/types";

export interface ChatList {
  messages: Message[];
}

const SCROLL_BOTTOM_OFFSET = 200;

export function ChatList({ messages }: ChatList) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, SCROLL_BOTTOM_OFFSET);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message: Message, index: number) => {
        return (
          <div key={index}>
            <ChatMessage message={message} />
            {index < messages.length - 1 && (
              <Separator className="my-4 md:my-8" />
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
