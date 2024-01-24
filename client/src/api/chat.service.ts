import { Chat, Message } from '@/lib/types';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL;
const STAGE = import.meta.env.VITE_STAGE;

const instance = axios.create({
  withCredentials: true,
});

export const removeChat = (id: string) => {
  //uklanja chat iz baze
};

export const handleLikeMessage = (): boolean => {
  console.log("LIKE")
  return true;
};

export const handleDislikeMessage = (): boolean => {
  console.log("DISLIKE")
  return true;
};

export const removeAllUserChats = () => {
  window.location.href = "/"

}

export const handleFetchAllUserChats = (): Chat[] => {
  const mock1: Chat = {
    id: "1",
    title: "Example1",
    userId: "user",
    createdAt: new Date(),
    path: "nekaPutanja1",
    messages: []
  }
  const mock2: Chat = {
    id: "2",
    title: "Example2",
    userId: "user",
    createdAt: new Date(),
    path: "nekaPutanja2",
    messages: []
  }
  return [mock1, mock2];
};

export const fetchChatMessages = (chatId: string): Message[] => {
  if (chatId === "") return []
  return [{ id: "1", content: "Cao", role: "user", liked:false, disliked:false }, { id: "2", content: "Cao ti", role: "bot", liked:false, disliked:false }]
}

export const handleFetchAnswer = (question: string): Promise<any> => {
  const res = fetchKnowledgeAnswer(question)
    .then(response => {
      console.log(response)
      return response;
    })
    .catch(err => {
      console.log(err)
    });
  return res;
};

async function fetchKnowledgeAnswer(question: string): Promise<string | null> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (STAGE === "test") {
    return "podaci"
  }
  try {
    const data = await instance.post('http://127.0.0.1:8000/chat', {
      text: 'What is the WiFi password?',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(data)
    return data.data
  } catch (error) {
    console.log(error);
    return null;
  }
}