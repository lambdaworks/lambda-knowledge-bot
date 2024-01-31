import { Chat, Message } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL;


export const removeChat = (id: string) => {
  console.log(id)
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

interface Document {
  source: string,
  topic: string
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
