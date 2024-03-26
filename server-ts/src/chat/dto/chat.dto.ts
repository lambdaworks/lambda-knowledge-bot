import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumberString, IsOptional } from 'class-validator';
export class CreateChatDto {
  @IsString()
  @ApiProperty()
  readonly content: string;
}

export class PaginationDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly lastKey: string;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly limit: string;
}

export class SentChatIdDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  readonly chatId: string;
}
