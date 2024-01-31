import { Chat } from '@/components/chat'
import { ChatType } from '@/lib/types'
import ChatLayout from './layout'
import { useState } from 'react';
import { handleFetchAllUserChats } from '@/api/chat.service';
import React from 'react';

export default function IndexPage() {
  const [chats, setChats] = useState<ChatType[]>(handleFetchAllUserChats());
  return <ChatLayout chats={chats} setChats={setChats}><Chat chats={chats} setChats={setChats}/></ChatLayout>
}
