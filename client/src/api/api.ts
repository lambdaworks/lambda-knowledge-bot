import { ChatType, Message } from '@/lib/types';
import { SESSION_STORAGE_KEYS } from '@/types/storage';

const API_URL = import.meta.env.VITE_API_URL;
export let stopGeneratingAnswer: boolean = false;

interface Document {
  source: string,
  topic: string
}

export const handleLikeMessage = (): boolean => {
  return true;
};

export const handleDislikeMessage = (): boolean => {
  return true;
};

export const removeAllUserChats = () => {}

export const handleFetchAllUserChats = (): ChatType[] => {
  const mock1: ChatType = {
    id: "1",
    title: "Example1",
    createdAt: new Date(),
    messages: [{ id: "1", content: "Hello!", role: "user", liked: false, disliked: false }, { id: "2", content: "How can I help you?", role: "system", liked: false, disliked: false }]
  }
  const mock2: ChatType = {
    id: "2",
    title: "Example2",
    createdAt: new Date(),
    messages: [{ id: "2", content: "Hello", role: "user", liked: false, disliked: false }, { id: "2", content: "Hello", role: "system", liked: false, disliked: false }]
  }
  return [mock1, mock2];
};

const getHeaders = (chatId: string | undefined) => {
  const headers: { [key: string]: string } = { 'Content-Type': 'application/json' };
  if (sessionStorage.getItem(`${SESSION_STORAGE_KEYS.CHAT_TOKEN}${chatId}`)) {
    const token = sessionStorage.getItem(`${SESSION_STORAGE_KEYS.CHAT_TOKEN}${chatId}`);
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const handleFetchAnswer = async (chatId: string | undefined, question: string): Promise<ReadableStreamDefaultReader<string>> => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: getHeaders(chatId),
    body: JSON.stringify({
      text: question
    })
  });
  if (response.headers) {
    const token = response.headers.get("set-authorization");
    if (token) {
      sessionStorage.setItem(`${SESSION_STORAGE_KEYS.CHAT_TOKEN}${chatId}`, token);
    }
  }
  const responseBody = response.body;

  if (!responseBody) {
    throw new Error('Response body is undefined');
  }

  return responseBody.pipeThrough(new TextDecoderStream()).getReader();
};

export const regenerateMessage = async (id: string | undefined, messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>>): Promise<void> => {
  if (messages.length === 0) return;
  try {
    const lastMessage = messages[messages.length - 1];
    setMessages(currentMessages => currentMessages.slice(0, -1))
    await appendBotAnswer(id, lastMessage.content, setMessages)
  } catch (error) {
    console.error("Error regenerating response:", error);
    return;
  }
};

export function stopGenerating() {
  stopGeneratingAnswer = true;
}

async function* streamAsyncIterator(reader: ReadableStreamDefaultReader) {
  stopGeneratingAnswer = false;
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

export const appendBotAnswer = async (id: string | undefined, question: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  try {
    const reader = await handleFetchAnswer(id, question);
    let firstToken = true;
    for await (const value of streamAsyncIterator(reader)) {
      firstToken = await parseAnswer(value, setMessages, firstToken);
      if (value.includes("event:finish") || stopGeneratingAnswer) {
        return;
      }
    }
  } catch (error) {
    return;
  }
}

export const parseAnswer = async (value: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>, firstToken: boolean): Promise<boolean> => {
  if (value.startsWith("data:")) {
    setMessages(currentMessages => {
      const data = parseData(value);
      const updatedMessages = [...currentMessages];
      if (!firstToken) {
        const lastMessageIndex = updatedMessages.length - 1;
        const lastMessage = updatedMessages[lastMessageIndex];
        lastMessage.content += data.messageToken;
        if (data.relevantDocuments) {
          const documentLinks = parseRelevantDocuments(data.relevantDocuments);
          if (documentLinks) {
            lastMessage.content += `\n\n Relevant documents: ${documentLinks}`;
          }
        }
        updatedMessages[lastMessageIndex] = lastMessage;
      } else {
        updatedMessages.push({ content: data.messageToken, role: "system", id: `message_${updatedMessages.length}`, liked: false, disliked: false });
      }
      return updatedMessages;
    });
    return false;
  }
  return firstToken;
};

export const parseData = (value: string): { messageToken: string, relevantDocuments: Document[] } => {
  const data: { messageToken: string, relevantDocuments: Document[] } = {
    messageToken: "",
    relevantDocuments: []
  }
  const sentences = value.split("\n");
  sentences.forEach(sentence => {
    if (sentence.startsWith("data:")) {
      const val = JSON.parse(sentence.substring(5));
      data.messageToken += val.messageToken;
      if (val.relevantDocuments) {
        data.relevantDocuments = [...data.relevantDocuments, ...val.relevantDocuments]
      }
    }
  });
  return data;
}

export const parseRelevantDocuments = (documents: Document[]): string => {
  const documentLinks = documents.map((doc: Document) => `[${doc.topic}](${doc.source})`).join(', ');
  return documentLinks;
}
