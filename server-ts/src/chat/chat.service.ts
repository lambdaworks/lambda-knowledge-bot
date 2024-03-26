import { Injectable } from '@nestjs/common';
import { concat, interval, map, take } from 'rxjs';
import { Chat, MessageRate } from './chat.interface';
import { CreateChatDto, RateMessageDto } from './dto';

@Injectable()
export class ChatService {
  getChats(sentLimit: string, lastKey: string): Chat[] {
    const limit = parseLimit(sentLimit);
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

  newChat(dto: CreateChatDto) {
    console.log({ sentChat: dto });
    const chat = {
      createdAt: new Date().toISOString(),
      id: '3863e85a-56cd-478a-abd3-5417ef0d7272',
      title: 'What about this?',
      userId: 'google-oauth2|102026784250201720394',
    };
    const message = ['I', ' don', "'t", ' know', '.'];
    const events = concat(
      [{ data: { messageToken: message[0] }, type: 'in_progress' }],
      interval(300).pipe(
        take(message.length - 1),
        map((index) => ({
          data: { messageToken: message[index + 1] },
          type: 'in_progress',
        })),
      ),
      [
        {
          data: { chat, messageToken: '', relevantDocuments: [] },
          type: 'finish',
        },
      ],
    );
    return events;
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

const parseLimit = (sentLimit: string): number => {
  const limit = Number(sentLimit) || 20;
  return Math.max(Math.min(50, limit), 1);
};
