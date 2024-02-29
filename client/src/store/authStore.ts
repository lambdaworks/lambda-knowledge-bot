import { makeAutoObservable, runInAction } from "mobx";

import RootStore from "./rootStore";
import { clearPersistedStore, makePersistable } from "mobx-persist-store";

export default class AuthStore {
  isSessionAvailable: boolean = false;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, {
      rootStore: false,
    });

    this.initPersist();
  }

  initPersist() {
    makePersistable(this, {
      name: "AuthStore",
      properties: ["isSessionAvailable"],
      storage: localStorage,
    });
  }

  setIsSessionAvailable(isSessionAvailable: boolean) {
    runInAction(() => {
      this.isSessionAvailable = isSessionAvailable;
    });
  }

  handleLogout() {
    this.rootStore.clearStore();
  }

  clearStore() {
    runInAction(() => {
      this.isSessionAvailable = false;
    });
  }

  async clearStoredData() {
    await clearPersistedStore(this);
  }
}
