import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ResearchService } from './research.service';
import { CreateResearchDto, ResearchType } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';
import { ResearchEntity } from './entities/research.entity';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiOperation({ summary: 'Create new research entry' })
  @ApiCreatedResponse({ type: ResearchEntity })
  @ApiUnprocessableEntityResponse({ description: 'Invalid research payload.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createResearchDto: CreateResearchDto) {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all research entries with optional type filter',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ResearchType,
    description: 'Filter entries by research type',
  })
  @ApiOkResponse({ type: ResearchEntity, isArray: true })
  findAll(@Query('type') type?: string) {
    return this.researchService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get research entry by ID' })
  @ApiParam({ name: 'id', description: 'Research UUID', format: 'uuid' })
  @ApiOkResponse({ type: ResearchEntity })
  @ApiNotFoundResponse({ description: 'Research entry not found.' })
  findOne(@Param('id') id: string) {
    return this.researchService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update research entry' })
  @ApiParam({ name: 'id', description: 'Research UUID', format: 'uuid' })
  @ApiOkResponse({ type: ResearchEntity })
  @ApiNotFoundResponse({ description: 'Research entry not found.' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid research payload.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateResearchDto: UpdateResearchDto,
  ) {
    return this.researchService.update(id, updateResearchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete research entry' })
  @ApiParam({ name: 'id', description: 'Research UUID', format: 'uuid' })
  @ApiOkResponse({ type: ResearchEntity })
  @ApiNotFoundResponse({ description: 'Research entry not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }
}
