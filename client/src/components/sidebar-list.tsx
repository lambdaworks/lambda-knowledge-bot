import { ClearHistory } from "@/components/clear-history";
import { SidebarItems } from "@/components/sidebar-items";
import { ChatType } from "@/lib/types";

interface SidebarListProps {
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

export function SidebarList({ chats, setChats }: SidebarListProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} setChats={setChats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ClearHistory clearChats={setChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  );
}
