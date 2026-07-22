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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramEntity } from './entities/program.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('programs')
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new program' })
  @ApiResponse({
    status: 201,
    description: 'The program has been successfully created.',
    type: ProgramEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all programs' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive'],
    description: 'Filter by program status',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: ['undergraduate', 'postgraduate'],
    description: 'Filter by education level',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all programs.',
    type: [ProgramEntity],
  })
  findAll(@Query('status') status?: string, @Query('level') level?: string) {
    return this.programService.findAll(status, level);
  }

  @Get('slug/:locale/:slug')
  @ApiOperation({ summary: 'Get a program by slug' })
  @ApiParam({
    name: 'locale',
    description: 'Locale (vi or en)',
    example: 'vi',
  })
  @ApiParam({
    name: 'slug',
    description: 'Program slug',
    example: 'cong-nghe-thong-tin',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the program.',
    type: ProgramEntity,
  })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  findBySlug(
    @Param('locale') locale: 'vi' | 'en',
    @Param('slug') slug: string,
  ) {
    return this.programService.findBySlug(slug, locale);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a program by ID' })
  @ApiParam({
    name: 'id',
    description: 'Program UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the program.',
    type: ProgramEntity,
  })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  findOne(@Param('id') id: string) {
    return this.programService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a program' })
  @ApiParam({
    name: 'id',
    description: 'Program UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The program has been successfully updated.',
    type: ProgramEntity,
  })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programService.update(id, updateProgramDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a program' })
  @ApiParam({
    name: 'id',
    description: 'Program UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The program has been successfully deleted.',
    type: ProgramEntity,
  })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.programService.remove(id);
  }
}
