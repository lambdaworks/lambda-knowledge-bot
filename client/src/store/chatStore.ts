import { makeAutoObservable, runInAction } from "mobx";
import RootStore from "./rootStore";
import { clearPersistedStore, makePersistable } from "mobx-persist-store";
import { ChatType, Message } from "@/lib/types";

const API_URL = import.meta.env.VITE_API_URL;

export const emptyChat = { id: "", title: "", messages: [], createdAt: null };

export default class ChatStore {
  currentChat: ChatType = emptyChat;
  isChatListLoaded: boolean = false;
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

  async fetchChats(token: string | undefined) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(`https://${API_URL}/chats`, {
        method: "GET",
        headers: headers,
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
        return chats;
      } else {
        this.setChats([]);
        return [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  async fetchChatMessages(accessToken: string, chatId: string) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    if (accessToken) {
      headers.append("Authorization", `Bearer ${accessToken}`);
    }

    try {
      const response = await fetch(
        `https://${API_URL}/chats/${chatId}/messages`,
        {
          method: "GET",
          headers: headers,
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
    }
  }

  clearStore() {
    runInAction(() => {
      this.chats = [];
      this.currentChat = emptyChat;
      this.isChatListLoaded = true;
    });
  }

  async clearStoredData() {
    await clearPersistedStore(this);
  }
}
