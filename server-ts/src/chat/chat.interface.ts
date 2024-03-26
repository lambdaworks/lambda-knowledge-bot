export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  releventDocuments: string[];
  role: string;
  createdAt: Date;
  userId: string;
  chatId: string;
}

export enum MessageRate {
  Like = 'LIKE',
  Dislike = 'DISLIKE',
}

export interface Document {
  source: string;
  topic: string;
}
