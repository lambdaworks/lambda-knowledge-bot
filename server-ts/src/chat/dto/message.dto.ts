import { IsString, IsUUID } from 'class-validator';

export class RateMessageDto {
  @IsString()
  @IsUUID()
  readonly chatId: string;
  @IsString()
  @IsUUID()
  readonly messageId: string;
}
