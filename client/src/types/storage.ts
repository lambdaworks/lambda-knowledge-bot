type LocalStorageKey = "sidebar";
type SessionStorageKey = "email" | "chatToken";

export const SESSION_STORAGE_KEYS: Record<string, SessionStorageKey> = {
  EMAIL: "email",
  CHAT_TOKEN: "chatToken",
};

export const LOCAL_STORAGE_KEYS: Record<string, LocalStorageKey> = {
  SIDEBAR: "sidebar",
};
