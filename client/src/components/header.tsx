import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/types/storage";
import { ChatType } from "@/lib/types";

import { SidebarMobile } from "./sidebar-mobile";
import { ChatHistory } from "./chat-history";
import Logo from "../assets/knowle-dark-bckrnd.svg";
import { IconSeparator } from "./ui/icons";
import { SidebarToggle } from "./sidebar-toggle";
import LoginButton from "./login-button";
import { Button } from "./ui/button";

function UserOrLogin() {
  const [chats, setChats] = useState<ChatType[]>([]);
  const { isAuthenticated, logout } = useAuth0();

  const handleLogout = async (): Promise<void> => {
    await logout({ logoutParams: { returnTo: window.location.origin } });
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.email);
    localStorage.setItem(LOCAL_STORAGE_KEYS.sidebar, "false");
  };

  return (
    <>
      {isAuthenticated && (
        <>
          <SidebarMobile>
            <ChatHistory chats={chats} setChats={setChats} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      )}
      <div className="flex align-items-center">
        {isAuthenticated ? (
          <>
            <IconSeparator className="size-6 text-muted-foreground/50 me-2" />
            <Button
              variant="outline"
              className="btn btn-primary"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <span>Knowλe</span>
      <a target="__blank" className="logo-container ml-[5px]">
        <img src={Logo} alt="Logo"></img>
      </a>
      <div className="flex-1" />
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
    </header>
  );
}
