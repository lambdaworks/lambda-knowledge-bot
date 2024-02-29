import { observer } from "mobx-react-lite";
import { SidebarDesktop } from "@/components/sidebar-desktop";
import { useContext } from "react";
import { StoreContext } from "@/store";

const ChatLayout = observer(({ children }) => {
  const { chatStore } = useContext(StoreContext);
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop chats={chatStore.chats} setChats={chatStore.setChats} />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {children}
      </div>
    </div>
  );
});

export default ChatLayout;
