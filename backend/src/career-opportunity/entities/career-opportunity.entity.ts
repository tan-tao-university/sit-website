import { ApiProperty } from '@nestjs/swagger';
import { CreateCareerOpportunityDto } from '../dto/create-career-opportunity.dto';

export class CareerOpportunityEntity extends CreateCareerOpportunityDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
