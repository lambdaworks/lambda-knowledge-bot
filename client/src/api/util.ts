export const isEmpty = (value: string | number | object | undefined | null): boolean =>
    !value || (typeof value === "object" && !Object.keys(value).length);

export type LocalStorageKey = "sidebar";

export type SessionStorageKey = "email";
