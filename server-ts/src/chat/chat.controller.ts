import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Sse,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, Message, MessageRate } from './chat.interface';
import { CreateChatDto, RateMessageDto } from './dto';
import { PaginationDto, SentChatIdDto } from './dto/chat.dto';
import { Response } from 'express';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/chats')
  async getChats(@Query() query: PaginationDto): Promise<Chat[]> {
    return this.chatService.getChats(query.limit ?? 20, query.lastKey);
  }
  @Post('/chats')
  @Sse()
  async newChat(@Res() res: Response, @Body() chatData: CreateChatDto) {
    return this.chatService.newChat(res, chatData);
  }
  @Get('/chats/:chatId/messages')
  async getChat(@Param() dto: SentChatIdDto): Promise<Message[]> {
    return this.chatService.getMessages(dto.chatId);
  }
  @Delete('/chats')
  async deleteChats(): Promise<string> {
    return this.chatService.deleteChats();
  }
  @Delete('/chats/:chatId')
  async deleteChat(@Param() dto: SentChatIdDto): Promise<string> {
    return this.chatService.deleteChat(dto.chatId);
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
