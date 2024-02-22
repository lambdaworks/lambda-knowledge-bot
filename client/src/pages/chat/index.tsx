import { useEffect, useState } from "react";

import { ChatType } from "@/lib/types";
import { handleFetchAllUserChats } from "@/api/api";
import { Chat } from "@/components/chat";

import ChatLayout from "./layout";

export default function IndexPage() {
  const [chats, setChats] = useState<ChatType[]>(handleFetchAllUserChats());

  return (
    <ChatLayout chats={chats} setChats={setChats}>
      <Chat chats={chats} setChats={setChats} />
    </ChatLayout>
  );
}
