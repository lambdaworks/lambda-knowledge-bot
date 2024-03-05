import AuthStore from "./authStore";
import ChatStore from "./chatStore";

export default class RootStore {
  authStore: AuthStore;
  chatStore: ChatStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.chatStore = new ChatStore(this);
  }

  appendTokenToHeaders(headers: Headers, token: string | undefined) {
    headers.append("Content-Type", "application/json");

    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }
    return headers;
  }

  async clearStore() {
    await this.authStore.clearStoredData();
    await this.chatStore.clearStoredData();
    this.authStore.clearStore();
    this.chatStore.clearStore();
  }
}
