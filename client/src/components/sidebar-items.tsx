import { AnimatePresence, motion } from "framer-motion";

import { ChatType } from "@/lib/types";
import { SidebarActions } from "@/components/sidebar-actions";
import { SidebarItem } from "@/components/sidebar-item";

interface SidebarItemsProps {
  chats?: ChatType[];
  setChats: (chats: ChatType[]) => void;
}

export function SidebarItems({ chats, setChats }: SidebarItemsProps) {
  const removeUserChat = (chat: ChatType): void => {
    const updatedChats = chats?.filter(
      (currentChat) => chat.id !== currentChat.id
    );
    // removeChat(chat.id)
    setChats(updatedChats || []);
  };

  const shareChat = () => {};

  if (!chats?.length) {
    return null;
  }

  return (
    <AnimatePresence>
      {chats.map(
        (chat: ChatType, index: number) =>
          chat && (
            <motion.div
              key={chat?.id}
              exit={{
                opacity: 0,
                height: 0,
              }}
            >
              <SidebarItem index={index} chat={chat}>
                <SidebarActions
                  chat={chat}
                  removeChat={() => removeUserChat(chat)}
                  shareChat={shareChat}
                />
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  );
}
