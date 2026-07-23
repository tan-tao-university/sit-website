import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProgramService } from '../program/program.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { NewsService } from '../news/news.service';
import { ResearchService } from '../research/research.service';
import { SearchResponseDto } from './dto/search-response.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly programService: ProgramService,
    private readonly curriculumService: CurriculumService,
    private readonly newsService: NewsService,
    private readonly researchService: ResearchService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Global search' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Text to search across public content',
    example: 'công nghệ thông tin',
  })
  @ApiOkResponse({ type: SearchResponseDto })
  async search(@Query('q') query: string) {
    if (!query) {
      return { programs: [], curriculums: [], news: [], research: [] };
    }

    const lowerQuery = query.toLowerCase();

    // 1. Programs
    const allPrograms = await this.programService.findAll();
    const filteredPrograms = allPrograms.filter(
      (p) =>
        p.nameVi?.toLowerCase().includes(lowerQuery) ||
        p.nameEn?.toLowerCase().includes(lowerQuery),
    );

    // 2. Curriculums
    const allCurriculums = await this.curriculumService.findAll();
    const filteredCurriculums = allCurriculums.filter(
      (c) =>
        c.nameVi?.toLowerCase().includes(lowerQuery) ||
        c.nameEn?.toLowerCase().includes(lowerQuery),
    );

    // 3. News
    const allNews = await this.newsService.findAll();
    const filteredNews = allNews.filter(
      (n) =>
        n.title?.toLowerCase().includes(lowerQuery) ||
        n.summary?.toLowerCase().includes(lowerQuery) ||
        n.contentText?.toLowerCase().includes(lowerQuery),
    );

    // 4. Research
    const allResearch = await this.researchService.findAll();
    const filteredResearch = allResearch.filter(
      (r) =>
        r.title?.toLowerCase().includes(lowerQuery) ||
        r.abstract?.toLowerCase().includes(lowerQuery) ||
        r.authors?.toLowerCase().includes(lowerQuery) ||
        r.keywords?.toLowerCase().includes(lowerQuery),
    );

    return {
      programs: filteredPrograms.slice(0, 5), // Limit results
      curriculums: filteredCurriculums.slice(0, 5),
      news: filteredNews.slice(0, 5),
      research: filteredResearch.slice(0, 5),
    };
  }
}
