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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import {
  CurriculumDetailsEntity,
  CurriculumEntity,
  CurriculumWithSectionsEntity,
} from './entities/curriculum.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('curriculums')
@Controller('curriculums')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new curriculum' })
  @ApiResponse({
    status: 201,
    description: 'The curriculum has been successfully created.',
    type: CurriculumEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createCurriculumDto: CreateCurriculumDto) {
    return this.curriculumService.create(createCurriculumDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all curriculums' })
  @ApiQuery({
    name: 'programId',
    required: false,
    description: 'Filter by program ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all curriculums.',
    type: [CurriculumEntity],
  })
  findAll(@Query('programId') programId?: string) {
    return this.curriculumService.findAll(programId);
  }

  @Get('by-slug/:locale/:programSlug/:curriculumSlug')
  @ApiOperation({
    summary: 'Get curriculum by program slug and curriculum slug',
  })
  @ApiParam({
    name: 'locale',
    description: 'Locale (vi or en)',
    enum: ['vi', 'en'],
    example: 'vi',
  })
  @ApiParam({
    name: 'programSlug',
    description: 'Program slug',
    example: 'cong-nghe-thong-tin',
  })
  @ApiParam({
    name: 'curriculumSlug',
    description: 'Curriculum slug',
    example: 'chuong-trinh-2024',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the curriculum with program and sections.',
    type: CurriculumDetailsEntity,
  })
  @ApiResponse({ status: 404, description: 'Curriculum not found.' })
  findByProgramSlugAndCurriculumSlug(
    @Param('locale') locale: 'vi' | 'en',
    @Param('programSlug') programSlug: string,
    @Param('curriculumSlug') curriculumSlug: string,
  ) {
    return this.curriculumService.findByProgramSlugAndCurriculumSlug(
      programSlug,
      curriculumSlug,
      locale,
    );
  }

  @Get('current/:programId')
  @ApiOperation({ summary: 'Get current curriculum for a program' })
  @ApiParam({
    name: 'programId',
    description: 'Program UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the current curriculum with sections.',
    type: CurriculumWithSectionsEntity,
  })
  @ApiResponse({ status: 404, description: 'Current curriculum not found.' })
  findCurrentByProgram(@Param('programId', ParseUUIDPipe) programId: string) {
    return this.curriculumService.findCurrentByProgram(programId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a curriculum by ID' })
  @ApiParam({
    name: 'id',
    description: 'Curriculum UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'includeSections',
    required: false,
    type: Boolean,
    description: 'Include curriculum sections',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the curriculum.',
    type: CurriculumEntity,
  })
  @ApiResponse({ status: 404, description: 'Curriculum not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeSections') includeSections?: boolean,
  ) {
    return this.curriculumService.findOne(id, includeSections);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a curriculum' })
  @ApiParam({
    name: 'id',
    description: 'Curriculum UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The curriculum has been successfully updated.',
    type: CurriculumEntity,
  })
  @ApiResponse({ status: 404, description: 'Curriculum not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumService.update(id, updateCurriculumDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a curriculum' })
  @ApiParam({
    name: 'id',
    description: 'Curriculum UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The curriculum has been successfully deleted.',
    type: CurriculumEntity,
  })
  @ApiResponse({ status: 404, description: 'Curriculum not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.curriculumService.remove(id);
  }
}
