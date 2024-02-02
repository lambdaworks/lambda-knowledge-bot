import { ChatType, Message } from '@/lib/types';
import { SetStateAction } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Document {
  source: string,
  topic: string
}

export const removeChat = (id: string) => { };

export const handleLikeMessage = (): boolean => {
  return true;
};

export const handleDislikeMessage = (): boolean => {
  return true;
};

export const removeAllUserChats = () => { }

export const handleFetchAllUserChats = (): ChatType[] => {
  const mock1: ChatType = {
    id: "1",
    title: "Example1",
    userId: "user",
    createdAt: new Date(),
    path: "1",
    messages: [{ id: "1", content: "Hello!", role: "user", liked: false, disliked: false }, { id: "2", content: "How can I help you?", role: "bot", liked: false, disliked: false }]
  }
  const mock2: ChatType = {
    id: "2",
    title: "Example2",
    userId: "user",
    createdAt: new Date(),
    path: "2",
    messages: [{ id: "2", content: "Hello", role: "user", liked: false, disliked: false }, { id: "2", content: "Hello", role: "bot", liked: false, disliked: false }]
  }
  return [mock1, mock2];
};

export const fetchChatMessages = (chatId: string): Message[] => {
  // fetches chat messages
  return []
}

export const handleFetchAnswer = async (question: string): Promise<ReadableStreamDefaultReader<string>> => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: question
    })
  });
  return response.body.pipeThrough(new TextDecoderStream()).getReader()
};

export const regenerateMessage = async (messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>>): Promise<Message[]> => {
  if (messages.length === 0) return [];
  try {
    const lastMessage = messages[messages.length - 1];
    await appendBotAnswer(lastMessage.content, messages.slice(0, -1), setMessages)
  } catch (error) {
    console.error("Error regenerating response:", error);
    return [];
  }
};

export const appendBotAnswer = async (question: string, messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  const reader = await handleFetchAnswer(question);
  let firstToken = true;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    firstToken = parseAnswer(value, messages, setMessages, firstToken)
    if (value.includes("event:finish")) {
      break;
    }
  }
}

export const parseAnswer = (value: string, messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>>, firstToken: boolean): boolean => {
  if (value.startsWith("data:")) {
    const data = JSON.parse(value.substring(5).split("\n")[0]);
    if (firstToken === false) {
      const lastMessage = messages[messages.length - 1];
      lastMessage.content += data.messageToken;
      if (data.relevantDocuments) {
        const documentLinks = parseRelevantDocuments(data.relevantDocuments)
        if (documentLinks) {
          lastMessage.content += `\n\n Relevant documents: ${documentLinks}`;
        }
      }
      const updatedMessages = messages.slice(0, -1).concat([{ ...lastMessage }]);
      setMessages(updatedMessages)
    } else {
      messages.push({ content: data.messageToken, role: "bot", id: "34", liked: false, disliked: false })
      setMessages(messages);
      firstToken = false
    }
  }
  return firstToken;
}

export const parseRelevantDocuments = (documents: [{ topic: string; source: string }]): string => {
  const relevantDocuments: Document[] = [];
  relevantDocuments.push(...documents);
  const documentLinks = documents.map((doc: Document) => `[${doc.topic}](${doc.source})`).join(', ');
  return documentLinks;
}