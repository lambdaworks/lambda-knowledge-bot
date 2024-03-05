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
      {!chatStore.isMessageListLoaded ? (
        <div className="flex flex-col flex-1 overflow-visible pt-10 md:pt-10 max-w-2xl mx-auto">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="relative mb-4 px-4" key={i}>
              <div className="relative flex flex-row items-start md:-ml-12 ">
                <div
                  key={i}
                  className="relative z-10 w-8 h-8 mr-5 rounded-md shrink-0 bg-zink-950 dark:bg-gray-800 animate-gradient"
                />
                <div
                  key={`${i} + 1`}
                  className="flex-1 h-8 rounded-md shrink-0 bg-zink-950 dark:bg-gray-800 animate-gradient"
                />
              </div>
              <div
                data-orientation="horizontal"
                role="none"
                className="flex-1 shrink-0 bg-border h-[1px] w-full my-4 md:my-8"
              />
            </div>
          ))}
        </div>
      ) : (
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
