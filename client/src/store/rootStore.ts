import AuthStore from "./authStore";
import ChatStore from "./chatStore";

export default class RootStore {
  authStore: AuthStore;
  chatStore: ChatStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.chatStore = new ChatStore(this);
  }

  async clearStore() {
    await this.authStore.clearStoredData();
    await this.chatStore.clearStoredData();
    this.authStore.clearStore();
    this.chatStore.clearStore();
  }
}
