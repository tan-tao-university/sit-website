import { PartialType } from '@nestjs/swagger';
import { CreateStudentPortfolioDto } from './create-student-portfolio.dto';

export class UpdateStudentPortfolioDto extends PartialType(
  CreateStudentPortfolioDto,
) {}
