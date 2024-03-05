import { useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";

import { ClearHistory } from "@/components/clear-history";
import { SidebarItems } from "@/components/sidebar-items";
import { ChatType } from "@/lib/types";

interface SidebarListProps {
  chats: ChatType[];
  setChats: (chats: ChatType[]) => void;
  hasMore: boolean;
  fetchMore: () => Promise<void>;
}

export function SidebarList({
  chats,
  setChats,
  hasMore,
  fetchMore,
}: SidebarListProps) {
  const scrollParentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto" ref={scrollParentRef}>
        <InfiniteScroll
          pageStart={0}
          initialLoad={true}
          loadMore={fetchMore}
          hasMore={hasMore}
          useWindow={false}
          loader={
            <div className="px-2 mt-2" key="loader">
              <div className="w-full h-8 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            </div>
          }
          getScrollParent={() => scrollParentRef.current}
        >
          {chats?.length ? (
            <div className="space-y-2 px-2">
              <SidebarItems chats={chats} setChats={setChats} />
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No chat history</p>
            </div>
          )}
        </InfiniteScroll>
      </div>
      <div className="flex items-center justify-between p-4">
        <ClearHistory clearChats={setChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  );
}
