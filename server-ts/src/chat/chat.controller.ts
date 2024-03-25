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
  getChats(
    @Query('limit') limit: string,
    @Query('lastKey') lastKey: string,
  ): Chat[] {
    return this.chatService.getChats(limit, lastKey);
  }
  @Post('/chats')
  newChat(@Body() chatData: CreateChatDto) {
    return this.chatService.newChat(chatData);
  }
  @Get('/chats/:chatId/messages')
  getChat(@Param('chatId') chatId: string): Message[] {
    return this.chatService.getMessages(chatId);
  }
  @Delete('/chats')
  deleteChats() {
    return this.chatService.deleteChats();
  }
  @Delete('/chats/:chatId')
  deleteChat(@Param('chatId') chatId: string) {
    return this.chatService.deleteChat(chatId);
  }
  @Put('/chat/message/like')
  likeMessage(@Body() dto: RateMessageDto) {
    return this.chatService.rateMessage(MessageRate.Like, dto);
  }
  @Put('/chat/message/dislike')
  dislikeMessage(@Body() dto: RateMessageDto) {
    return this.chatService.rateMessage(MessageRate.Dislike, dto);
  }
}
