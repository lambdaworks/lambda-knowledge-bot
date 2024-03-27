import { Injectable } from '@nestjs/common';
import { Chat, MessageRate } from './chat.interface';
import { CreateChatDto, RateMessageDto } from './dto';
import { LLMService } from 'src/llm/llm.service';
import { Response } from 'express';
import { ChatRepository } from './chat.repository';
@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: LLMService,
    private readonly chatRepo: ChatRepository,
  ) {}

  async getChats(limit: number, lastKey: string): Promise<Chat[]> {
    console.log({ sentData: { limit, lastKey } });
    return await this.chatRepo.getUserAllChats('userId', limit, lastKey);
  }

  async newChat(res: Response, dto: CreateChatDto) {
    const now = new Date();
    const chat: Chat = {
      createdAt: now,
      id: '3863e85a-56cd-478a-abd3-5417ef0d7272',
      title: 'What about this?',
      userId: 'google-oauth2|102026784250201720394',
    };
    await this.chatRepo.newChat(chat, 'userId');
    await this.llmService.retrieve(res, dto.content);
    res.end();
  }
  deleteChats() {
    return 'OK';
  }
  deleteChat(chatId: string) {
    console.log({ sentChatId: chatId });
    return 'OK';
  }
  getMessages(chatId: string) {
    console.log({ sentChatId: chatId });
    return [
      {
        chatId,
        content: 'What about this?',
        createdAt: new Date(),
        id: 'ea132af1-257e-4f29-a656-8bb47f5460f9',
        releventDocuments: [],
        role: 'user',
        userId: 'google-oauth2|102026784250201720394',
      },
      {
        chatId,
        content: "I don't know.",
        createdAt: new Date(),
        id: 'cdd94184-4808-4580-b40a-75289d2bb2a0',
        releventDocuments: [],
        role: 'assistant',
        userId: 'google-oauth2|102026784250201720394',
      },
    ];
  }
  rateMessage(rating: MessageRate, dto: RateMessageDto) {
    console.log({ sentData: { rating, dto } });
    return 'OK';
  }
}
