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
import { AlumniService } from './alumni.service';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';
import { AlumniEntity } from './entities/alumni.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('alumni')
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alumni profile' })
  @ApiResponse({
    status: 201,
    description: 'The alumni profile has been successfully created.',
    type: AlumniEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createAlumniDto: CreateAlumniDto) {
    return this.alumniService.create(createAlumniDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alumni profiles' })
  @ApiResponse({
    status: 200,
    description: 'Return all alumni profiles.',
    type: [AlumniEntity],
  })
  findAll() {
    return this.alumniService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alumni profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'Alumni UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the alumni profile and details.',
    type: AlumniEntity,
  })
  @ApiResponse({ status: 404, description: 'Alumni not found.' })
  findOne(@Param('id') id: string) {
    return this.alumniService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alumni profile' })
  @ApiParam({
    name: 'id',
    description: 'Alumni UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'The alumni profile has been successfully updated.',
    type: AlumniEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateAlumniDto: UpdateAlumniDto) {
    return this.alumniService.update(id, updateAlumniDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alumni profile' })
  @ApiParam({
    name: 'id',
    description: 'Alumni UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'The alumni profile has been successfully deleted.',
    type: AlumniEntity,
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.alumniService.remove(id);
  }
}
