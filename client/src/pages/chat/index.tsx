import { useContext, useEffect } from "react";

import { Chat } from "@/components/chat";
import ChatLayout from "./layout";
import { StoreContext } from "@/store";
import { useAuth0 } from "@auth0/auth0-react";

const IndexPage = () => {
  const { chatStore } = useContext(StoreContext);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

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
