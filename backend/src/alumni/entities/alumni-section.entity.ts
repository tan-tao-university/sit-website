import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAlumniSectionDto } from '../dto/create-alumni-section.dto';

export class AlumniSectionEntity extends CreateAlumniSectionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  createdAt?: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  updatedAt?: Date | null;
}
