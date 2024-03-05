import { makeAutoObservable, runInAction } from "mobx";
import { clearPersistedStore, makePersistable } from "mobx-persist-store";

import { ChatType, Message } from "@/lib/types";
import { handleFetchAnswer } from "@/api/api";
import { EVENT_REGEX } from "@/utils/regex";
import { CHATS_PER_PAGE } from "@/utils/constants";

import RootStore from "./rootStore";

const API_URL = import.meta.env.VITE_API_URL;

export const emptyChat = { id: "", title: "", messages: [], createdAt: null };

export default class ChatStore {
  currentChat: ChatType = emptyChat;
  isChatListLoaded: boolean = false;
  isMessageListLoaded: boolean = true;
  hasMoreChats: boolean = true;
  chats: ChatType[] = [];
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
    });
  }

  initPersist() {
    makePersistable(this, {
      name: "ChatStore",
      properties: ["currentChat"],
      storage: localStorage,
    });
  }

  setCurrentChat(currentChat: ChatType) {
    runInAction(() => {
      this.currentChat = currentChat;
    });
  }

  setChats(chats: ChatType[]) {
    runInAction(() => {
      this.chats = chats;
    });
  }

  setCurrentMessages(currentMessages: Message[]) {
    runInAction(() => {
      this.currentChat = {
        ...this.currentChat,
        messages: currentMessages,
      };
    });
  }

  setCurrentChatId(chatId: string) {
    runInAction(() => {
      this.currentChat = {
        ...this.currentChat,
        id: chatId,
      };
    });
  }

  setIsChatListLoaded(isChatListLoaded: boolean) {
    runInAction(() => {
      this.isChatListLoaded = isChatListLoaded;
    });
  }

  setIsMessageListLoaded(isMessageListLoaded: boolean) {
    runInAction(() => {
      this.isMessageListLoaded = isMessageListLoaded;
    });
  }

  setHasMoreChats(hasMoreChats: boolean) {
    runInAction(() => {
      this.hasMoreChats = hasMoreChats;
    });
  }

  addCurrentMessage(currentMessage: Message) {
    runInAction(() => {
      this.currentChat = {
        ...this.currentChat,
        messages: this.currentChat.messages
          ? [...this.currentChat.messages, currentMessage]
          : [currentMessage],
      };

      const updatedChats = this.chats.map((chat) => {
        if (chat.id === this.currentChat.id) {
          return {
            ...chat,
            messages: chat.messages
              ? [...chat.messages, currentMessage]
              : [currentMessage],
          };
        }
        return chat;
      });

      this.chats = updatedChats;
    });
  }

  removeLastMessage() {
    runInAction(() => {
      this.currentChat.messages = this.currentChat?.messages?.slice(0, -1);

      const updatedChats = this.chats.map((chat) => {
        if (chat.id === this.currentChat.id) {
          return {
            ...chat,
            messages: chat.messages?.slice(0, -1),
          };
        }
        return chat;
      });

      this.chats = updatedChats;
    });
  }

  async fetchChats(accessToken: string | undefined) {
    try {
      const response = await fetch(`https://${API_URL}/chats`, {
        method: "GET",
        headers: this.rootStore.appendTokenToHeaders(
          new Headers(),
          accessToken
        ),
      });

      if (response.ok) {
        const data = await response.json();
        const chats: ChatType[] = [...data].map((chat) => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          userId: chat.userId,
          messages: [],
        }));

        this.setChats(chats);

        this.setHasMoreChats(
          chats.length >= CHATS_PER_PAGE && chats.length !== 0
        );

        return chats;
      } else {
        this.setChats([]);
        return [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  async fetchMoreChats(accessToken: string | undefined) {
    const lastKey = this.chats[this.chats?.length - 1].createdAt;

    try {
      const response = await fetch(
        `https://${API_URL}/chats?limit=${CHATS_PER_PAGE}&lastKey=${lastKey}`,
        {
          method: "GET",
          headers: this.rootStore.appendTokenToHeaders(
            new Headers(),
            accessToken
          ),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const chatArray: ChatType[] = [...data].map((chat) => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          userId: chat.userId,
          messages: [],
        }));

        this.setChats([...this.chats, ...chatArray]);
        this.setHasMoreChats(
          chatArray.length >= CHATS_PER_PAGE && chatArray.length !== 0
        );

        return chatArray;
      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  async fetchChatMessages(accessToken: string, chatId: string) {
    try {
      const response = await fetch(
        `https://${API_URL}/chats/${chatId}/messages`,
        {
          method: "GET",
          headers: this.rootStore.appendTokenToHeaders(
            new Headers(),
            accessToken
          ),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reversedMessages = [...data].reverse();
        this.setCurrentMessages(reversedMessages);
      } else {
        this.setCurrentMessages([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.setIsMessageListLoaded(true);
    }
  }

  async appendBotAnswer(
    chatId: string | undefined,
    question: string,
    token?: string
  ) {
    try {
      const answer = await handleFetchAnswer(chatId, question, token);

      this.addCurrentMessage({
        content: answer,
        role: "system",
        id: `message_${answer.length}`,
        liked: false,
        disliked: false,
      });
    } catch (error) {
      return;
    }
  }

  async regenerateMessage(id: string | undefined, currentMessages: Message[]) {
    if (currentMessages.length === 0) {
      return;
    }

    try {
      const lastMessage = currentMessages[currentMessages.length - 1];
      this.removeLastMessage();
      await this.appendBotAnswer(id, lastMessage.content);
    } catch (error) {
      console.error("Error regenerating response:", error);
      return;
    }
  }

  async handleFetchAnswer(
    chatId: string | undefined,
    question: string,
    accessToken?: string
  ) {
    let answer = "";

    try {
      const aborter = new AbortController();
      const response = await fetch(
        chatId
          ? `https://${API_URL}/chats/${chatId}`
          : `https://${API_URL}/chats`,
        {
          method: "POST",
          headers: this.rootStore.appendTokenToHeaders(
            new Headers(),
            accessToken
          ),
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
          const eventTypeMatch = decodedChunkString.match(EVENT_REGEX);
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
  }

  clearStore() {
    runInAction(() => {
      this.chats = [];
      this.currentChat = emptyChat;
      this.isChatListLoaded = true;
      this.isMessageListLoaded = true;
      this.hasMoreChats = true;
    });
  }

  async clearStoredData() {
    await clearPersistedStore(this);
  }
}
