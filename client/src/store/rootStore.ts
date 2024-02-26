import AuthStore from "./authStore";

export default class RootStore {
  authStore: AuthStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.authStore.initPersist();
  }

  async clearStore() {
    await this.authStore.clearStoredData();
    this.authStore.clearStore();
  }
}
