import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { APP_PIPE } from '@nestjs/core';
import { LLMService } from './llm/llm.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ChatModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    LLMService,
  ],
})
export class AppModule {}
