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
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth0Guard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/utils/interface';
import {
  CreateMessageDto,
  PaginationDto,
  RateMessageDto,
  SentChatIdDto,
} from './dto/chat.dto';

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
    return await this.chatService.getChats(
      req.user.sub,
      query.limit,
      query.lastKey,
    );
  }
  @Post('/chats')
  @UseGuards(Auth0Guard(true))
  @Sse()
  async newChat(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Body() body: CreateMessageDto,
  ) {
    return await this.chatService.newMessage(res, body, req.user.sub);
  }

  @Post('/chats/:chatId')
  @UseGuards(Auth0Guard(true))
  @Sse()
  async newMessageInChat(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Body() body: CreateMessageDto,
    @Param() param: SentChatIdDto,
  ) {
    console.log({ sentChatId: param.chatId });
    return await this.chatService.newMessage(
      res,
      body,
      req.user.sub,
      param.chatId,
    );
  }
  @Get('/chats/:chatId/messages')
  @UseGuards(Auth0Guard())
  async getChat(
    @Req() req: RequestWithUser,
    @Param() param: SentChatIdDto,
    @Query() query: PaginationDto,
  ): Promise<Message[]> {
    return await this.chatService.getChatHistory(
      param.chatId,
      req.user.sub,
      query.limit,
      query.lastKey,
    );
  }
  @Delete('/chats')
  @UseGuards(Auth0Guard())
  async deleteChats(@Req() req: RequestWithUser): Promise<string> {
    return this.chatService.deleteChats(req.user.sub);
  }
  @Delete('/chats/:chatId')
  @UseGuards(Auth0Guard())
  async deleteChat(
    @Req() req: RequestWithUser,
    @Param() param: SentChatIdDto,
  ): Promise<string> {
    return this.chatService.deleteChat(param.chatId);
  }
  @Put('/chat/message/like')
  @UseGuards(Auth0Guard())
  async likeMessage(@Body() body: RateMessageDto): Promise<string> {
    return this.chatService.rateMessage(MessageRate.Like, body);
  }
  @Put('/chat/message/dislike')
  @UseGuards(Auth0Guard())
  async dislikeMessage(@Body() body: RateMessageDto): Promise<string> {
    return this.chatService.rateMessage(MessageRate.Dislike, body);
  }
}
