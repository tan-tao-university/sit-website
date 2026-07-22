import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';
import { CareerOpportunityService } from './career-opportunity.service';
import {
  CareerOpportunityStatus,
  CareerOpportunityType,
  CareerWorkMode,
  CreateCareerOpportunityDto,
} from './dto/create-career-opportunity.dto';
import { UpdateCareerOpportunityDto } from './dto/update-career-opportunity.dto';
import { CareerOpportunityEntity } from './entities/career-opportunity.entity';

@ApiTags('career-opportunities')
@Controller('career-opportunities')
export class CareerOpportunityController {
  constructor(
    private readonly careerOpportunityService: CareerOpportunityService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a career opportunity' })
  @ApiCreatedResponse({ type: CareerOpportunityEntity })
  @ApiUnprocessableEntityResponse({ description: 'Invalid opportunity.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCareerOpportunityDto) {
    return this.careerOpportunityService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get published, open career opportunities' })
  @ApiQuery({ name: 'type', required: false, enum: CareerOpportunityType })
  @ApiQuery({ name: 'workMode', required: false, enum: CareerWorkMode })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: CareerOpportunityEntity, isArray: true })
  findPublished(
    @Query('type') type?: CareerOpportunityType,
    @Query('workMode') workMode?: CareerWorkMode,
    @Query('limit') rawLimit?: string,
  ) {
    const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : undefined;
    const limit =
      parsedLimit && parsedLimit > 0 ? Math.min(parsedLimit, 100) : undefined;

    return this.careerOpportunityService.findPublished({
      type,
      workMode,
      limit,
    });
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get all career opportunities for administrators' })
  @ApiQuery({ name: 'status', required: false, enum: CareerOpportunityStatus })
  @ApiQuery({ name: 'type', required: false, enum: CareerOpportunityType })
  @ApiOkResponse({ type: CareerOpportunityEntity, isArray: true })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllAdmin(
    @Query('status') status?: CareerOpportunityStatus,
    @Query('type') type?: CareerOpportunityType,
  ) {
    return this.careerOpportunityService.findAllAdmin({ status, type });
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Get one career opportunity for administrators' })
  @ApiOkResponse({ type: CareerOpportunityEntity })
  @ApiNotFoundResponse({ description: 'Career opportunity not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOneAdmin(@Param('id') id: string) {
    return this.careerOpportunityService.findOneAdmin(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a career opportunity' })
  @ApiOkResponse({ type: CareerOpportunityEntity })
  @ApiNotFoundResponse({ description: 'Career opportunity not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateCareerOpportunityDto) {
    return this.careerOpportunityService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a career opportunity' })
  @ApiOkResponse({ description: 'Career opportunity deleted.' })
  @ApiNotFoundResponse({ description: 'Career opportunity not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.careerOpportunityService.remove(id);
  }
}
