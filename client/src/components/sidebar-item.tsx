import React, { useContext } from "react";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { IconMessage, IconUsers } from "@/components/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { type ChatType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StoreContext } from "@/store";

interface SidebarItemProps {
  index: number;
  chat: ChatType;
  children: React.ReactNode;
}

export function SidebarItem({ index, chat, children }: SidebarItemProps) {
  const isActive = true;
  const { getAccessTokenSilently } = useAuth0();
  const { chatStore } = useContext(StoreContext);
  const [newChatId, setNewChatId] = useLocalStorage("newChatId", null);
  const shouldAnimate = index === 0 && isActive && newChatId;

  const handleAnimationCompleted = () => {
    if (index === chat.title.length - 1) {
      setNewChatId(null);
    }
  };

  const getChatMessages = async (): Promise<void> => {
    chatStore.setCurrentChat(chat);
    chatStore.setIsMessageListLoaded(false);
    const accessToken = await getAccessTokenSilently();
    await chatStore.fetchChatMessages(accessToken, chat.id);
  };

  if (!chat?.id) {
    return null;
  }

  return (
    <motion.div
      className="relative h-8 cursor-pointer"
      variants={{
        initial: {
          height: 0,
          opacity: 0,
        },
        animate: {
          height: "auto",
          opacity: 1,
        },
      }}
      initial={shouldAnimate ? "initial" : undefined}
      animate={shouldAnimate ? "animate" : undefined}
      transition={{
        duration: 0.25,
        ease: "easeIn",
      }}
    >
      <div className="text-gray-800 absolute left-2 top-1 flex h-6 w-6 items-center justify-center">
        {chat.sharePath ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <IconUsers className="mr-2" />
            </TooltipTrigger>
            <TooltipContent>This is a shared chat.</TooltipContent>
          </Tooltip>
        ) : (
          <IconMessage className="mr-2" />
        )}
      </div>
      <Link
        to={`?chatId=${chat.id}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-gray-800 group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10",
          isActive && "bg-zinc-200 pr-16 font-semibold dark:bg-zinc-800"
        )}
        onClick={getChatMessages}
      >
        <div
          className="title relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="whitespace-nowrap">
            {shouldAnimate ? (
              chat.title.split("").map((character, index) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: {
                      opacity: 0,
                      x: -100,
                    },
                    animate: {
                      opacity: 1,
                      x: 0,
                    },
                  }}
                  initial={shouldAnimate ? "initial" : undefined}
                  animate={shouldAnimate ? "animate" : undefined}
                  transition={{
                    duration: 0.25,
                    ease: "easeIn",
                    delay: index * 0.05,
                    staggerChildren: 0.05,
                  }}
                  onAnimationComplete={handleAnimationCompleted}
                >
                  {character}
                </motion.span>
              ))
            ) : (
              <span>{chat.title}</span>
            )}
          </span>
        </div>
      </Link>
      {isActive && <div className="absolute right-2 top-1">{children}</div>}
    </motion.div>
  );
}
