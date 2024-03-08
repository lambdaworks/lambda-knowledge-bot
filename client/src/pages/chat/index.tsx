import { useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { Chat } from "@/components/chat";
import { StoreContext } from "@/store";
import { CHECK_TIME } from "@/utils/constants";

import ChatLayout from "./layout";

const IndexPage = () => {
  const { chatStore, authStore } = useContext(StoreContext);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!authStore.isSessionAvailable && isAuthenticated) {
      authStore.setIsSessionAvailable(true);
    }
  }, [isAuthenticated, authStore]);

  // Fix deployed version when session is invalidated
  // Refresh will check the if session is valid
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isAuthenticated) {
      timer = setTimeout(async () => {
        if (authStore.isSessionAvailable && !isAuthenticated) {
          authStore.setIsSessionAvailable(false);
          chatStore.clearStore();
          await chatStore.clearStoredData();
        }
      }, CHECK_TIME);
    }

    return () => clearTimeout(timer);
  }, [isAuthenticated, authStore, chatStore, isAuthenticated]);

  useEffect(() => {
    const fetchChats = async () => {
      const token = await getAccessTokenSilently();
      chatStore.setIsChatListLoaded(false);
      await chatStore.fetchChats(token || undefined);
      chatStore.setIsChatListLoaded(true);
    };

    isAuthenticated && fetchChats();
  }, [isAuthenticated, chatStore]);

  // Persist currentChat only when users are logged in
  useEffect(() => {
    if (isAuthenticated) {
      chatStore.initPersist();
    }
  }, [isAuthenticated]);

  return (
    <ChatLayout>
      <Chat />
    </ChatLayout>
  );
};

export default IndexPage;
