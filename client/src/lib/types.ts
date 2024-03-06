export interface Message {
  id: string;
  createdAt?: Date;
  content: string;
  liked: boolean;
  relevantDocuments?: Array<{ source: string; topic: string }>;
  disliked: boolean;
  role: "system" | "user" | "assistant" | "function" | "data" | "tool" | "bot";
}

export interface ChatType extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date | null;
  messages?: Message[];
  sharePath?: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>;
