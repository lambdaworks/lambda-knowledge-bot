export const isEmpty = (value: string | number | object | undefined | null): boolean =>
    !value || (typeof value === "object" && !Object.keys(value).length);
