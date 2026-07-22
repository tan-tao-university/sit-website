import { ApiProperty } from '@nestjs/swagger';

export class TranslationResponseDto {
  @ApiProperty({ example: 'Chào mừng đến với Trường Công nghệ Thông tin' })
  translatedText: string;
}
