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
    setMessages(currentMessages => currentMessages.slice(0, -1))
    await appendBotAnswer(lastMessage.content, setMessages)
  } catch (error) {
    console.error("Error regenerating response:", error);
    return [];
  }
};

async function* streamAsyncIterator(reader: ReadableStreamDefaultReader) {
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export const appendBotAnswer = async (question: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  try {
    const reader = await handleFetchAnswer(question);
    let firstToken = true;
    for await (const value of streamAsyncIterator(reader)) {
      if (value.startsWith("data:")) {
        const data = JSON.parse(value.substring(5).split("\n")[0]);
        setMessages(currentMessages => {
          let updatedMessages = [...currentMessages];
          if (!firstToken) {
            const lastMessage = { ...updatedMessages[updatedMessages.length - 1] };
            lastMessage.content += data.messageToken;
            if (data.relevantDocuments) {
              const documentLinks = parseRelevantDocuments(data.relevantDocuments);
              if (documentLinks) {
                lastMessage.content += `\n\n Relevant documents: ${documentLinks}`;
              }
            }
            updatedMessages[updatedMessages.length - 1] = lastMessage;
          } else {
            updatedMessages.push({ content: data.messageToken, role: "bot", id: `message_${updatedMessages.length}`, liked: false, disliked: false });
            firstToken = false;
          }
          return updatedMessages;
        });

      } if (value.includes("event:finish")) {
        break;
      }
    }
  } catch (error) {
    console.error("Error fetching or processing the answer:", error);
  }
}

export const parseRelevantDocuments = (documents: [{ topic: string; source: string }]): string => {
  const relevantDocuments: Document[] = [];
  relevantDocuments.push(...documents);
  const documentLinks = documents.map((doc: Document) => `[${doc.topic}](${doc.source})`).join(', ');
  return documentLinks;
}