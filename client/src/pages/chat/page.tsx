import { handleFetchAllUserChats } from '@/api/chat.service';
import { Chat } from '@/components/chat'
import { ChatType } from '@/lib/types';
import React from 'react';
import { useState } from 'react';

export interface ChatPageProps {

}

export default async function ChatPage() {
  const [chats, setChats] = useState<ChatType[]>([]);
  React.useEffect(() => {
    const chats = handleFetchAllUserChats();
    setChats(chats);
  }, []);
  return <Chat initialMessages={[]} chats={chats} setChats={setChats} />
}
