import { ApiProperty } from '@nestjs/swagger';
import { CurriculumEntity } from '../../curriculum/entities/curriculum.entity';
import { NewsEntity } from '../../news/entities/news.entity';
import { ProgramEntity } from '../../program/entities/program.entity';
import { ResearchEntity } from '../../research/entities/research.entity';

export class SearchResponseDto {
  @ApiProperty({ type: ProgramEntity, isArray: true })
  programs: ProgramEntity[];

  @ApiProperty({ type: CurriculumEntity, isArray: true })
  curriculums: CurriculumEntity[];

  @ApiProperty({ type: NewsEntity, isArray: true })
  news: NewsEntity[];

  @ApiProperty({ type: ResearchEntity, isArray: true })
  research: ResearchEntity[];
}
