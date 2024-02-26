import { createContext } from "react";

import RootStoreModel from "./rootStore";

export const StoreContext = createContext<RootStoreModel>({} as RootStoreModel);
export const StoreProvider = StoreContext.Provider;
