import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Sse,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, Message, MessageRate } from './chat.interface';
import { CreateChatDto, RateMessageDto } from './dto';
import { PaginationDto, SentChatIdDto } from './dto/chat.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth0Guard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/utils/interface';

@Controller()
@ApiTags('ChatService')
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/chats')
  @UseGuards(Auth0Guard())
  async getChats(
    @Query() query: PaginationDto,
    @Req() req: RequestWithUser,
  ): Promise<Chat[]> {
    console.log(req.user);
    return this.chatService.getChats(query.limit ?? 20, query.lastKey);
  }
  @Post('/chats')
  @UseGuards(Auth0Guard(true))
  @Sse()
  async newChat(@Res() res: Response, @Body() chatData: CreateChatDto) {
    return this.chatService.newChat(res, chatData);
  }
  @Get('/chats/:chatId/messages')
  @UseGuards(Auth0Guard())
  async getChat(@Param() dto: SentChatIdDto): Promise<Message[]> {
    return this.chatService.getMessages(dto.chatId);
  }
  @Delete('/chats')
  @UseGuards(Auth0Guard())
  async deleteChats(): Promise<string> {
    return this.chatService.deleteChats();
  }
  @Delete('/chats/:chatId')
  @UseGuards(Auth0Guard())
  async deleteChat(@Param() dto: SentChatIdDto): Promise<string> {
    return this.chatService.deleteChat(dto.chatId);
  }
  @Put('/chat/message/like')
  @UseGuards(Auth0Guard())
  async likeMessage(@Body() dto: RateMessageDto): Promise<string> {
    return this.chatService.rateMessage(MessageRate.Like, dto);
  }
  @Put('/chat/message/dislike')
  @UseGuards(Auth0Guard())
  async dislikeMessage(@Body() dto: RateMessageDto): Promise<string> {
    return this.chatService.rateMessage(MessageRate.Dislike, dto);
  }
}
