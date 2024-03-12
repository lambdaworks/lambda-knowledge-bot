import { useContext, useState } from "react";
import { StreamingTextResponse } from "ai";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useAuth0 } from "@auth0/auth0-react";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyScreen } from "@/components/empty-screen";
import { Message } from "@/lib/types";
import { StoreContext } from "@/store";
import { ChatScrollAnchor } from "./chat-scroll-anchor";
import { emptyChat } from "@/store/chatStore";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

interface AppendParams {
  content: string | StreamingTextResponse;
  role: "function" | "data" | "system" | "user" | "assistant" | "tool" | "bot";
}

export const Chat = observer(({ className }: ChatProps) => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { chatStore } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const stop = (): void => {
    setIsLoading(false);
  };

  const reload = async (): Promise<void> => {
    let accessToken;

    if (isAuthenticated) {
      accessToken = await getAccessTokenSilently();
    }

    try {
      setIsLoading(true);

      await chatStore.regenerateMessage(
        chatStore.currentChat?.id,
        chatStore.currentChat.messages || [],
        accessToken || undefined
      );
    } finally {
      setIsLoading(false);
    }
  };

  const append: (val: AppendParams) => Promise<void> = async (val) => {
    // Ensure content is a string
    const content = typeof val.content === "string" ? val.content : "";
    const newMessage = {
      content,
      role: val.role,
      id: "34",
      liked: false,
      disliked: false,
    };

    if (!!chatStore.currentChat.id) {
      chatStore.addCurrentMessage(newMessage);
    } else {
      if (isAuthenticated) {
        chatStore.setCurrentChat(emptyChat);
      }
      chatStore.addCurrentMessage(newMessage);
    }

    try {
      setIsLoading(true);
      let token;

      if (isAuthenticated) {
        token = await getAccessTokenSilently();
      }

      await chatStore.appendBotAnswer(
        chatStore.currentChat?.id,
        content,
        token
      );

      if (!chatStore.currentChat?.id && token) {
        // Fetch chats and take id from the first one in chats array
        const chats = await chatStore.fetchChats(token);
        if (chats) {
          chatStore.setChats(chats);
          chatStore.setCurrentChatId(chats[0].id);

          const searchParams = new URLSearchParams();
          searchParams.append("chatId", String(chats[0].id));
          navigate(`?${searchParams}`);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!chatStore.isMessageListLoaded ? null : (
        <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
          {chatStore.currentChat?.messages?.length ? (
            <>
              <ChatList messages={chatStore.currentChat.messages || []} />
              <ChatScrollAnchor trackVisibility={isLoading} />
            </>
          ) : (
            <EmptyScreen setInput={setInput} />
          )}
        </div>
      )}
      <ChatPanel
        title="title"
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={chatStore.currentChat.messages || []}
        input={input}
        setInput={setInput}
      />
    </>
  );
});
