import React, { useContext, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IconSpinner } from "@/components/ui/icons";
import { StoreContext } from "@/store";

interface ClearHistoryProps {
  isEnabled: boolean;
}

export function ClearHistory({ isEnabled = false }: ClearHistoryProps) {
  const { chatStore } = useContext(StoreContext);
  const { getAccessTokenSilently } = useAuth0();
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.preventDefault();
    setIsPending(true);
    try {
      const accessToken = await getAccessTokenSilently();
      await chatStore.removeAllChats(accessToken);
    } finally {
      setIsPending(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" disabled={!isEnabled || isPending}>
          {isPending && <IconSpinner className="mr-2" />}
          Clear history
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your chat history and remove your data
            from our servers.
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
  );
}
