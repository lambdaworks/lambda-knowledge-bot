import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, Message, MessageRate } from './chat.interface';
import { CreateChatDto, RateMessageDto } from './dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/chats')
  async getChats(
    @Query('limit') limit: number,
    @Query('lastKey') lastKey: string,
  ): Promise<Chat[]> {
    return this.chatService.getChats(limit, lastKey);
  }
  @Post('/chats')
  async newChat(@Body() chatData: CreateChatDto) {
    return this.chatService.newChat(chatData);
  }
  @Get('/chats/:chatId/messages')
  async getChat(@Param('chatId') chatId: string): Promise<Message[]> {
    return this.chatService.getMessages(chatId);
  }
  @Delete('/chats')
  async deleteChats(): Promise<string> {
    return this.chatService.deleteChats();
  }
  @Delete('/chats/:chatId')
  async deleteChat(@Param('chatId') chatId: string): Promise<string> {
    return this.chatService.deleteChat(chatId);
  }
  @Put('/chat/message/like')
  async likeMessage(@Body() dto: RateMessageDto): Promise<string> {
    return this.chatService.rateMessage(MessageRate.Like, dto);
  }
  @Put('/chat/message/dislike')
  async dislikeMessage(@Body() dto: RateMessageDto): Promise<string> {
    return this.chatService.rateMessage(MessageRate.Dislike, dto);
  }
}
