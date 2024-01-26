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
  return [{ id: "1", content: "Cao", role: "user", liked: false, disliked: false }, { id: "2", content: "Cao ti", role: "bot", liked: false, disliked: false }]
}

export const handleFetchAnswer = async (question: string): Promise<any> => {
  const response = await fetch('http://127.0.0.1:8000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: question
    })
  });
  console.log(response);
  let accumulated = "";
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let finish = false;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    console.log(value);
    accumulated += value;

    if (value.includes("event:finish")) {
      finish = true;
      break;
    }
  }

  let result = {
    message: "",
    relevantDocuments: []
  };

  if (finish) {
    const lines = accumulated.split('\n');
    for (const line of lines) {
      if (line.startsWith("data:")) {
        try {
          const data = JSON.parse(line.substring(5));
          result.message += data.messageToken;

          if (data.relevantDocuments && Array.isArray(data.relevantDocuments)) {
            result.relevantDocuments.push(...data.relevantDocuments);

            const documentLinks = data.relevantDocuments.map((doc: { topic: any; source: any; }) =>
              `[${doc.topic}](${doc.source})`
            ).join(', ');

            if (documentLinks) {
              result.message += `\n\n Relevant documents: ${documentLinks}`;
            }
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    }
  }
  return result;
};