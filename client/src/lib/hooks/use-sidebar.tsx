import React, { useContext } from "react";
import { observer } from "mobx-react-lite";

import { StoreContext } from "@/store/context";

interface SidebarContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
}

const SidebarContext = React.createContext<SidebarContext | undefined>(
  undefined
);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider = observer(
  ({ children }: SidebarProviderProps) => {
    const { authStore } = useContext(StoreContext);
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const [isLoading, setLoading] = React.useState(true);

    React.useEffect(() => {
      setSidebarOpen(authStore.isSessionAvailable);
      setLoading(false);
    }, [authStore.isSessionAvailable]);

    const toggleSidebar = () => {
      setSidebarOpen((value) => {
        const newState = !value;
        return newState;
      });
    };

    if (isLoading) {
      return null;
    }

    return (
      <SidebarContext.Provider
        value={{ isSidebarOpen, toggleSidebar, isLoading }}
      >
        {children}
      </SidebarContext.Provider>
    );
  }
);
