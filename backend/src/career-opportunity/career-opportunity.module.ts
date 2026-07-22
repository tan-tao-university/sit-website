import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CareerOpportunityController } from './career-opportunity.controller';
import { CareerOpportunityService } from './career-opportunity.service';

@Module({
  imports: [AuthModule],
  controllers: [CareerOpportunityController],
  providers: [CareerOpportunityService],
})
export class CareerOpportunityModule {}
