import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AlumniSectionService } from './alumni-section.service';
import { CreateAlumniSectionDto } from './dto/create-alumni-section.dto';
import { UpdateAlumniSectionDto } from './dto/update-alumni-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';
import { AlumniSectionEntity } from './entities/alumni-section.entity';

@ApiTags('alumni-sections')
@Controller('alumni-sections')
export class AlumniSectionController {
  constructor(private readonly alumniSectionService: AlumniSectionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alumni section' })
  @ApiResponse({
    status: 201,
    description: 'The alumni section has been successfully created.',
    type: AlumniSectionEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createAlumniSectionDto: CreateAlumniSectionDto) {
    return this.alumniSectionService.create(createAlumniSectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alumni sections' })
  @ApiResponse({
    status: 200,
    description: 'Return all active alumni sections.',
    type: AlumniSectionEntity,
    isArray: true,
  })
  findAll() {
    return this.alumniSectionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alumni section by ID' })
  @ApiParam({
    name: 'id',
    description: 'Alumni Section UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the alumni section details.',
    type: AlumniSectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Alumni section not found.' })
  findOne(@Param('id') id: string) {
    return this.alumniSectionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alumni section' })
  @ApiParam({
    name: 'id',
    description: 'Alumni Section UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'The alumni section has been successfully updated.',
    type: AlumniSectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Alumni section not found.' })
  @ApiResponse({ status: 422, description: 'Invalid alumni section payload.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateAlumniSectionDto: UpdateAlumniSectionDto,
  ) {
    return this.alumniSectionService.update(id, updateAlumniSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alumni section' })
  @ApiParam({
    name: 'id',
    description: 'Alumni Section UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'The alumni section has been successfully deleted.',
    type: AlumniSectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Alumni section not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.alumniSectionService.remove(id);
  }
}
