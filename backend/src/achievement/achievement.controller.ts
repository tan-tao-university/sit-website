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
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AchievementService } from './achievement.service';
import {
  AchievementLevel,
  AchievementType,
  AchievementVisibility,
  CreateAchievementDto,
} from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';
import { AchievementEntity } from './entities/achievement.entity';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Post()
  @ApiOperation({ summary: 'Create new achievement' })
  @ApiCreatedResponse({ type: AchievementEntity })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid achievement payload.',
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createAchievementDto: CreateAchievementDto) {
    return this.achievementService.create(createAchievementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all achievements with optional filters' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: AchievementType,
    description: 'Filter by achievement type',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: AchievementLevel,
    description: 'Filter by achievement level',
  })
  @ApiQuery({
    name: 'visibility',
    required: false,
    enum: AchievementVisibility,
    description: 'Filter by visibility',
  })
  @ApiQuery({
    name: 'isHighlight',
    required: false,
    type: Boolean,
    description: 'Filter by highlight status',
  })
  @ApiOkResponse({ type: AchievementEntity, isArray: true })
  findAll(
    @Query('type') type?: string,
    @Query('level') level?: string,
    @Query('visibility') visibility?: string,
    @Query('isHighlight') isHighlight?: string,
  ) {
    return this.achievementService.findAll({
      type,
      level,
      visibility,
      isHighlight:
        isHighlight === 'true'
          ? true
          : isHighlight === 'false'
            ? false
            : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get achievement by ID' })
  @ApiParam({ name: 'id', description: 'Achievement UUID', format: 'uuid' })
  @ApiOkResponse({ type: AchievementEntity })
  @ApiNotFoundResponse({ description: 'Achievement not found.' })
  findOne(@Param('id') id: string) {
    return this.achievementService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update achievement' })
  @ApiParam({ name: 'id', description: 'Achievement UUID', format: 'uuid' })
  @ApiOkResponse({ type: AchievementEntity })
  @ApiNotFoundResponse({ description: 'Achievement not found.' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid achievement payload.',
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {
    return this.achievementService.update(id, updateAchievementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete achievement' })
  @ApiParam({ name: 'id', description: 'Achievement UUID', format: 'uuid' })
  @ApiOkResponse({ type: AchievementEntity })
  @ApiNotFoundResponse({ description: 'Achievement not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.achievementService.remove(id);
  }
}
