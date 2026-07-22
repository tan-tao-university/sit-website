import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateResearchDto } from '../dto/create-research.dto';

export class ResearchEntity extends CreateResearchDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  publishedAt?: Date | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
