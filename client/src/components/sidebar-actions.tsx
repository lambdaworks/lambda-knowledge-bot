import React, { useContext, useState, useTransition } from "react";
import { toast } from "react-hot-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconShare, IconSpinner, IconTrash } from "@/components/ui/icons";
import { ChatShareDialog } from "@/components/chat-share-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatType } from "@/lib/types";
import { StoreContext } from "@/store";
import { useAuth0 } from "@auth0/auth0-react";

interface SidebarActionsProps {
  chat: ChatType;
  removeChat: () => void;
  shareChat: () => void;
}

export function SidebarActions({
  chat,
  removeChat,
  shareChat,
}: SidebarActionsProps) {
  const { chatStore } = useContext(StoreContext);
  const { getAccessTokenSilently } = useAuth0();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setIsPending(true);
    try {
      const accessToken = await getAccessTokenSilently();
      await chatStore.removeChatById(accessToken, chat.id);
    } finally {
      setIsShareDialogOpen(false);
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="text-gray-800 space-x-1 hover:text-white">
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-background"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <IconShare />
              <span className="sr-only">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-background"
              disabled={isPending}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
      </div>
      <ChatShareDialog
        chat={chat}
        shareChat={shareChat}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        onCopy={() => setIsShareDialogOpen(false)}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleDelete}>
              {isPending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
