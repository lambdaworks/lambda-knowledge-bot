import { ChatType } from '@/lib/types'
import ChatLayout from './layout'
import { useState } from 'react';
import { handleFetchAllUserChats } from '@/api/api';
import React from 'react';
import { Chat } from '@/components/chat';

export default function IndexPage() {
  const [chats, setChats] = useState<ChatType[]>(handleFetchAllUserChats());
  return <ChatLayout chats={chats} setChats={setChats}><Chat chats={chats} setChats={setChats}/></ChatLayout>
}
