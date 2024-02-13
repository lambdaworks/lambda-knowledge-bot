import React, { useCallback, useTransition } from "react";

import { type DialogProps } from "@radix-ui/react-dialog";
import { toast } from "react-hot-toast";

import { ChatType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconSpinner } from "@/components/ui/icons";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

interface ChatShareDialogProps extends DialogProps {
  chat: Pick<ChatType, "title" | "messages">;
  shareChat: () => void;
  onCopy: () => void;
}

const TIME_OUT = 1000;

export function ChatShareDialog({
  chat,
  onCopy,
  shareChat,
  ...props
}: ChatShareDialogProps) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: TIME_OUT });
  const [isSharePending, startShareTransition] = useTransition();

  const copyShareLink = useCallback(
    async (chat: ChatType) => {
      const url = new URL(window.location.href);
      if (chat.id) url.pathname = chat.id;
      copyToClipboard(url.toString());
      onCopy();
      toast.success("Share link copied to clipboard", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          fontSize: "14px",
        },
        iconTheme: {
          primary: "white",
          secondary: "black",
        },
      });
    },
    [copyToClipboard, onCopy]
  );

  const handleCopy = (): void => {
    // @ts-expect-error
    startShareTransition(async () => copyShareLink(chat as Chat));
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to chat</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view the shared chat.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-1 text-sm border rounded-md">
          <div className="font-medium">{chat.title}</div>
          <div className="text-muted-foreground">
            {chat.messages.length} messages
          </div>
        </div>
        <DialogFooter className="items-center">
          <Button disabled={isSharePending} onClick={handleCopy}>
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Copying...
              </>
            ) : (
              <>Copy link</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
