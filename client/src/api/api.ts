import { ChatType, Message } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL;

interface Document {
  source: string,
  topic: string
}

export const removeChat = (id: string) => {};

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

export const handleFetchAnswer = async (question: string): Promise<{
  message: string,
  relevantDocuments: Document[]
}> => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: question
    })
  });
  let accumulated = "";
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    accumulated += value;
    if (value.includes("event:finish")) {
      break;
    }
  }

  return parseAnswer(accumulated);
};

function parseAnswer(accumulated: string) {
  const result = {
    message: "",
    relevantDocuments: []
  };
  const lines = accumulated.split('\n');
  for (const line of lines) {
    if (line.startsWith("data:")) {
      try {
        const data = JSON.parse(line.substring(5));
        result.message += data.messageToken;

        if (data.relevantDocuments) {
          result.relevantDocuments.push(...data.relevantDocuments);

          const documentLinks = data.relevantDocuments.map((doc: Document) => `[${doc.topic}](${doc.source})`
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
  return result;
}

export const regenerateMessage = async (messages: Message[]): Promise<Message[]> => {
  if (messages.length === 0) return [];
  try {
    const lastMessage = messages[messages.length - 1];
    const newContent = await handleFetchAnswer(lastMessage.content);
    const updatedMessages = messages.slice(0, -1).concat([{ ...lastMessage, content: newContent.message }]);
    return updatedMessages;
  } catch (error) {
    console.error("Error regenerating response:", error);
    return [];
  }
};
