import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateNewsDto } from '../dto/news.dto';

export class NewsEntity extends OmitType(CreateNewsDto, [
  'publishedAt',
] as const) {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ description: 'Plain-text content used by search' })
  contentText?: string;

  @ApiProperty({ format: 'date-time' })
  publishedAt: Date;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
