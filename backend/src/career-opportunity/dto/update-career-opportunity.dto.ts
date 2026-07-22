import { PartialType } from '@nestjs/swagger';
import { CreateCareerOpportunityDto } from './create-career-opportunity.dto';

export class UpdateCareerOpportunityDto extends PartialType(
  CreateCareerOpportunityDto,
) {}
