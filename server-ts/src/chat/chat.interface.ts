export interface Chat {
  createdAt: Date;
  id: string;
  title: string;
  userId: string;
}

export interface Message {
  chatId: string;
  content: string;
  createdAt: Date;
  id: string;
  releventDocuments: string[];
  role: string;
  userId: string;
}

export enum MessageRate {
  Like = 'LIKE',
  Dislike = 'DISLIKE',
}
