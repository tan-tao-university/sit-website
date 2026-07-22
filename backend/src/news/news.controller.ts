import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';
import { NewsEntity } from './entities/news.entity';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create news article' })
  @ApiCreatedResponse({ type: NewsEntity })
  @ApiUnprocessableEntityResponse({ description: 'Invalid news payload.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all news articles' })
  @ApiOkResponse({ type: NewsEntity, isArray: true })
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news article by ID or slug' })
  @ApiParam({ name: 'id', description: 'News UUID or slug' })
  @ApiOkResponse({ type: NewsEntity })
  @ApiNotFoundResponse({ description: 'News article not found.' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update news article' })
  @ApiParam({ name: 'id', description: 'News UUID' })
  @ApiOkResponse({ type: NewsEntity })
  @ApiNotFoundResponse({ description: 'News article not found.' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid news payload.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete news article' })
  @ApiParam({ name: 'id', description: 'News UUID' })
  @ApiOkResponse({ type: NewsEntity })
  @ApiNotFoundResponse({ description: 'News article not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
