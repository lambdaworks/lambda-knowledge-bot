export let stopGeneratingAnswer: boolean = false;

export const handleLikeMessage = (): boolean => {
  return true;
};

export const handleDislikeMessage = (): boolean => {
  return true;
};

export const removeAllUserChats = () => {};

export const handleFetchAnswer = async (
  chatId: string | undefined,
  question: string,
  token?: string
): Promise<string> => {
  let answer = "";

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  try {
    const aborter = new AbortController();
    const response = await fetch(
      chatId
        ? `https://knowle-api.lambdaworks.io/chats/${chatId}`
        : "https://knowle-api.lambdaworks.io/chats",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          content: question,
        }),
        signal: aborter.signal,
      }
    );

    const reader = response?.body?.getReader();
    const decoder = new TextDecoder();
    let loopRunner = true;

    while (loopRunner) {
      //@ts-ignore
      const { value } = await reader?.read();

      const decodedChunkString = decoder.decode(value, { stream: true });

      let dataIndex = decodedChunkString.indexOf("data:");
      let eventIndex = decodedChunkString.indexOf("event:");

      while (dataIndex !== -1 && eventIndex !== -1) {
        const jsonData = decodedChunkString.substring(
          dataIndex + 5,
          eventIndex
        );

        const decodedChunk = JSON.parse(jsonData);

        let eventType = null;
        const eventTypeMatch = decodedChunkString.match(/event:(\w+)/);
        if (eventTypeMatch) {
          eventType = eventTypeMatch[1];
        }

        if (eventType === "in_progress") {
          if (decodedChunk.messageToken) {
            answer += decodedChunk.messageToken;
          }
        } else if (eventType === "finish") {
          if (decodedChunk.relevantDocuments?.length) {
            answer += "\n\nRelevant documents:\n";
            decodedChunk.relevantDocuments.map(
              (document: any) => (answer += document.source + ", ")
            );
          }
          loopRunner = false;
          break;
        }

        dataIndex = decodedChunkString.indexOf("data:", eventIndex);
        eventIndex = decodedChunkString.indexOf("event:", dataIndex);
      }
    }

    if (!loopRunner) {
      aborter.abort();
    }
  } catch (error) {
    console.error("Error fetching bot response:", error);
    return "Sorry, something went wrong. Please try again later.";
  }

  return answer || "I don't know.";
};

export function stopGenerating() {
  stopGeneratingAnswer = true;
}
