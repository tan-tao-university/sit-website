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
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';
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
import { CreateEventDto, EventStatus } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiCreatedResponse({ type: EventEntity })
  @ApiUnprocessableEntityResponse({ description: 'Invalid event payload.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get events' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiQuery({ name: 'status', required: false, enum: EventStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: EventEntity, isArray: true })
  findAll(
    @Query('upcoming') upcoming?: string,
    @Query('status') status?: string,
    @Query('limit') rawLimit?: string,
  ) {
    const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : undefined;
    const limit =
      parsedLimit && parsedLimit > 0 ? Math.min(parsedLimit, 50) : undefined;

    return this.eventService.findAll({
      upcoming: upcoming === 'true',
      status,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiOkResponse({ type: EventEntity })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiOkResponse({ type: EventEntity })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiOkResponse({ description: 'Event deleted.' })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
