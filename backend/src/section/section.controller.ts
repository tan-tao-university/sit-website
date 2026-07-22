import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionEntity } from './entities/section.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('sections')
@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new section' })
  @ApiResponse({
    status: 201,
    description: 'The section has been successfully created.',
    type: SectionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(createSectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sections' })
  @ApiQuery({
    name: 'curriculumId',
    required: false,
    description: 'Filter by curriculum ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all sections.',
    type: [SectionEntity],
  })
  findAll(@Query('curriculumId') curriculumId?: string) {
    return this.sectionService.findAll(curriculumId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiParam({
    name: 'id',
    description: 'Section UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the section.',
    type: SectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Section not found.' })
  findOne(@Param('id') id: string) {
    return this.sectionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a section' })
  @ApiParam({
    name: 'id',
    description: 'Section UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The section has been successfully updated.',
    type: SectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Section not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionService.update(id, updateSectionDto);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Update section display order' })
  @ApiParam({
    name: 'id',
    description: 'Section UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        displayOrder: {
          type: 'number',
          example: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The section order has been successfully updated.',
    type: SectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Section not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateOrder(
    @Param('id') id: string,
    @Body('displayOrder') displayOrder: number,
  ) {
    return this.sectionService.updateOrder(id, displayOrder);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a section' })
  @ApiParam({
    name: 'id',
    description: 'Section UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The section has been successfully deleted.',
    type: SectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Section not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.sectionService.remove(id);
  }
}
