import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LLMService } from 'src/llm/llm.service';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [ChatService, LLMService, ChatRepository],
})
export class ChatModule {}
