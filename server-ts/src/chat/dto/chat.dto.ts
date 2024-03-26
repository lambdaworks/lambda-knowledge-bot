import { IsString, IsUUID, IsNumberString, IsOptional } from 'class-validator';
export class CreateChatDto {
  @IsString()
  readonly content: string;
}

export class PaginationDto {
  @IsString()
  @IsOptional()
  readonly lastKey: string;

  @IsNumberString()
  @IsOptional()
  readonly limit: string;
}

export class SentChatIdDto {
  @IsString()
  @IsUUID()
  readonly chatId: string;
}
