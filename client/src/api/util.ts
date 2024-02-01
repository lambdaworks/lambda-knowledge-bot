export const isEmpty = (
    value: string | number | object | undefined | null
): boolean => {
    if (value === null) {
        return true;
    } else if (typeof value !== "number" && value === "") {
        return true;
    } else if (typeof value === "undefined" || value === undefined) {
        return true;
    } else if (
        value !== null &&
        typeof value === "object" &&
        Object.keys(value).length === 0
    ) {
        return true;
    } else {
        return false;
    }
};