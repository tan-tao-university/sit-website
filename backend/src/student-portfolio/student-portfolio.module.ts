import { Module } from '@nestjs/common';
import { StudentPortfolioService } from './student-portfolio.service';
import { StudentPortfolioController } from './student-portfolio.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StudentPortfolioController],
  providers: [StudentPortfolioService],
  exports: [StudentPortfolioService],
})
export class StudentPortfolioModule {}
