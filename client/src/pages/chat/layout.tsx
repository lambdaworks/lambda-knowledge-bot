import { SidebarDesktop } from '@/components/sidebar-desktop'
import { ChatType } from '@/lib/types'

interface ChatLayoutProps {
  chats: ChatType[]
  children: React.ReactNode
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

export default function ChatLayout({ chats, children, setChats }: ChatLayoutProps) {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop chats={chats} setChats={ setChats} />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {children}
      </div>
    </div>
  )
}
