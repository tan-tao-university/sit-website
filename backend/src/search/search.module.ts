import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { ProgramModule } from '../program/program.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { NewsModule } from '../news/news.module';
import { ResearchModule } from '../research/research.module';

@Module({
  imports: [ProgramModule, CurriculumModule, NewsModule, ResearchModule],
  controllers: [SearchController],
  providers: [],
})
export class SearchModule {}
