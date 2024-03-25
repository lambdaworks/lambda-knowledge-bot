import { Injectable } from '@nestjs/common';
import { Chat, MessageRate } from './chat.interface';
import { CreateChatDto, RateMessageDto } from './dto';

@Injectable()
export class ChatService {
  getChats(limit: string, lastKey: string): Chat[] {
    console.log({ sentData: { limit, lastKey } });
    return [
      {
        createdAt: new Date(),
        id: 'e3c3b6bc-57e5-41c7-901c-2ff13d16a6e8',
        title: 'What about this?',
        userId: 'google-oauth2|102026784250201720394',
      },

      {
        createdAt: new Date(),
        id: '12514574-2030-48b4-99a7-350fc0c13241',
        title: 'What about this?',
        userId: 'google-oauth2|102026784250201720394',
      },
      {
        createdAt: new Date(),
        id: '5dc17f07-45c9-46fd-8e9b-76446e06dbd3',
        title: 'What about this?',
        userId: 'google-oauth2|102026784250201720394',
      },
    ];
  }

  newChat(chat: CreateChatDto) {
    console.log({ sentChat: chat });
    return { messageToken: "I don't know" };
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
