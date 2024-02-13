import { Sidebar } from "@/components/sidebar";
import { ChatHistory } from "@/components/chat-history";
import { ChatType } from "@/lib/types";

interface SidebarProps {
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

export function SidebarDesktop({ chats, setChats }: SidebarProps) {
  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      <ChatHistory chats={chats} setChats={setChats} />
    </Sidebar>
  );
}
