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
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CourseEntity } from './entities/course.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'The course has been successfully created.',
    type: CourseEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'List of all courses',
    type: [CourseEntity],
  })
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', description: 'Course UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'The course details',
    type: CourseEntity,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id', description: 'Course UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully updated.',
    type: CourseEntity,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id', description: 'Course UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }
}
