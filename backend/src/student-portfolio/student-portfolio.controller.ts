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
import { StudentPortfolioService } from './student-portfolio.service';
import { CreateStudentPortfolioDto } from './dto/create-student-portfolio.dto';
import { UpdateStudentPortfolioDto } from './dto/update-student-portfolio.dto';
import { StudentPortfolioEntity } from './entities/student-portfolio.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('student-portfolio')
@Controller('student-portfolio')
export class StudentPortfolioController {
  constructor(
    private readonly studentPortfolioService: StudentPortfolioService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student portfolio' })
  @ApiResponse({
    status: 201,
    description: 'The portfolio has been successfully created.',
    type: StudentPortfolioEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateStudentPortfolioDto) {
    return this.studentPortfolioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published student portfolios' })
  @ApiResponse({
    status: 200,
    description: 'Return all published portfolios.',
    type: [StudentPortfolioEntity],
  })
  findAll() {
    return this.studentPortfolioService.findAll();
  }

  @Get('admin/list')
  @ApiOperation({ summary: 'Get all portfolios, including unpublished ones' })
  @ApiResponse({
    status: 200,
    description: 'Return all portfolios regardless of publish state.',
    type: [StudentPortfolioEntity],
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllForAdmin() {
    return this.studentPortfolioService.findAllForAdmin();
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Get a portfolio by ID, including unpublished' })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiResponse({
    status: 200,
    description: 'Return the portfolio and its details.',
    type: StudentPortfolioEntity,
  })
  @ApiResponse({ status: 404, description: 'Portfolio not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOneForAdmin(@Param('id') id: string) {
    return this.studentPortfolioService.findOne(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published portfolio by slug (public URL)' })
  @ApiParam({ name: 'slug', description: 'Portfolio slug' })
  @ApiResponse({
    status: 200,
    description: 'Return the published portfolio and its details.',
    type: StudentPortfolioEntity,
  })
  @ApiResponse({ status: 404, description: 'Portfolio not found.' })
  findOne(@Param('slug') slug: string) {
    return this.studentPortfolioService.findPublishedBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a student portfolio' })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiResponse({
    status: 200,
    description: 'The portfolio has been successfully updated.',
    type: StudentPortfolioEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateStudentPortfolioDto) {
    return this.studentPortfolioService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student portfolio' })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiResponse({
    status: 200,
    description: 'The portfolio has been successfully deleted.',
    type: StudentPortfolioEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.studentPortfolioService.remove(id);
  }
}
