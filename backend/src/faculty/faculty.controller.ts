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
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { FacultyEntity } from './entities/faculty.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('faculty')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new faculty profile' })
  @ApiResponse({
    status: 201,
    description: 'The faculty profile has been successfully created.',
    type: FacultyEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all faculty profiles' })
  @ApiResponse({
    status: 200,
    description: 'Return all faculty profiles.',
    type: [FacultyEntity],
  })
  findAll() {
    return this.facultyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a faculty profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'Faculty UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the faculty profile and details.',
    type: FacultyEntity,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  findOne(@Param('id') id: string) {
    return this.facultyService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a faculty profile by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Faculty slug',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the faculty profile and details.',
    type: FacultyEntity,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.facultyService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a faculty profile' })
  @ApiParam({
    name: 'id',
    description: 'Faculty UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'The faculty profile has been successfully updated.',
    type: FacultyEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
    return this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a faculty profile' })
  @ApiParam({
    name: 'id',
    description: 'Faculty UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'The faculty profile has been successfully deleted.',
    type: FacultyEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.facultyService.remove(id);
  }
}
