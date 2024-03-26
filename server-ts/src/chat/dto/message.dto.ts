import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RateMessageDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  readonly chatId: string;
  @IsString()
  @IsUUID()
  @ApiProperty()
  readonly messageId: string;
}
