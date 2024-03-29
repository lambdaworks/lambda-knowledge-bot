import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/ui/icons";

const exampleMessages = [
  {
    heading: "Ask a question from our knowledge base",
    message: `What is a Wifi password?`,
  },
  {
    heading: "Summarize an article",
    message: "Summarize the following article for a 2nd grader:",
  },
  {
    heading: "Draft an email",
    message: `Draft an email to my boss about the following:`,
  },
];

export function EmptyScreen({ setInput }: { setInput: (val: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Welcome to Knowλe!</h1>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index: number) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
