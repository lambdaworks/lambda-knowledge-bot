import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

import { Type } from 'class-transformer';
export class CreateMessageDto {
  @IsString()
  @ApiProperty()
  readonly content: string;
}

export class PaginationDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly lastKey?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  @ApiPropertyOptional()
  readonly limit?: number;
}

export class SentChatIdDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  readonly chatId: string;
}

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
