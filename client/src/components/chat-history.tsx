import { useContext } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useAuth0 } from "@auth0/auth0-react";

import { cn } from "@/lib/utils";
import { SidebarList } from "@/components/sidebar-list";
import { buttonVariants } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { ChatType } from "@/lib/types";
import { StoreContext } from "@/store";
import { emptyChat } from "@/store/chatStore";

interface ChatHistoryProps {
  chats: ChatType[];
  setChats: (chats: ChatType[]) => void;
}

export const ChatHistory = observer(
  ({ chats = [], setChats }: ChatHistoryProps) => {
    const { chatStore } = useContext(StoreContext);

    const { getAccessTokenSilently } = useAuth0();

    const handleFetchMore = async () => {
      const token = await getAccessTokenSilently();
      await chatStore.fetchMoreChats(token);
    };

    const handleNewChat = () => {
      chatStore.setCurrentChat(emptyChat);
      chatStore.setHasMoreMessages(true);
    };

    return (
      <div className="flex flex-col h-full">
        <div className="px-2 my-4">
          <Link
            to={window.location.origin}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "text-black h-10 w-full justify-start bg-zinc-50 px-4 shadow-none hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10 cursor-pointer"
            )}
            onClick={handleNewChat}
          >
            <IconPlus className="-translate-x-2 stroke-2" />
            New Chat
          </Link>
        </div>

        {!chatStore.isChatListLoaded ? (
          <div className="flex flex-col flex-1 px-2 space-y-4 overflow-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-8 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : (
          <SidebarList
            chats={chats}
            setChats={setChats}
            hasMore={chatStore.hasMoreChats}
            fetchMore={handleFetchMore}
          />
        )}
      </div>
    );
  }
);
