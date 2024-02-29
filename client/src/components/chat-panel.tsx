import { useState } from "react";
import { StreamingTextResponse } from "ai";

import { Button } from "@/components/ui/button";
import { PromptForm } from "@/components/prompt-form";
import { ButtonScrollToBottom } from "@/components/button-scroll-to-bottom";
import { IconRefresh, IconShare, IconStop } from "@/components/ui/icons";
import { ChatShareDialog } from "@/components/chat-share-dialog";
import { Message } from "@/lib/types";

export interface ChatPanelProps {
  title?: string;
  append: (val: {
    content: string | StreamingTextResponse;
    role:
      | "function"
      | "data"
      | "system"
      | "user"
      | "assistant"
      | "tool"
      | "bot";
  }) => Promise<void>;
  isLoading: boolean;
  reload: () => void;
  messages: Message[];
  stop: () => void;
  input: string;
  setInput: (val: string) => void;
}

export function ChatPanel({
  title,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages = [],
}: ChatPanelProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handlePromptSubmit = async (value: string) => {
    await append({
      content: value,
      role: "user",
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex items-center justify-center h-12">
          {isLoading ? (
            <Button variant="outline" onClick={stop} className="bg-background">
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length >= 2 && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => reload()}>
                  <IconRefresh className="mr-2" />
                  Regenerate response
                </Button>
                {title ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <IconShare className="mr-2" />
                      Share
                    </Button>
                    <ChatShareDialog
                      open={shareDialogOpen}
                      onOpenChange={setShareDialogOpen}
                      onCopy={() => setShareDialogOpen(false)}
                      shareChat={() => {}}
                      chat={{
                        title,
                        messages,
                      }}
                    />
                  </>
                ) : null}
              </div>
            )
          )}
        </div>
        <div className="px-4 py-2 space-y-4 border-t shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={handlePromptSubmit}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
