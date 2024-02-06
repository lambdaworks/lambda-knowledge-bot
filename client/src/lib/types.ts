export interface Message {
  id: string;
  createdAt?: Date;
  content: string;
  liked: boolean;
  disliked: boolean
  role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool';
}

export interface ChatType extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
    error: string
  }
>
