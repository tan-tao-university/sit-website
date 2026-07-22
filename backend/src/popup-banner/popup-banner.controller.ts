import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';
import { CreatePopupBannerDto } from './dto/create-popup-banner.dto';
import { UpdatePopupBannerDto } from './dto/update-popup-banner.dto';
import { PopupBannerEntity } from './entities/popup-banner.entity';
import { PopupBannerService } from './popup-banner.service';

@ApiTags('popup-banners')
@Controller('popup-banners')
export class PopupBannerController {
  constructor(private readonly popupBannerService: PopupBannerService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active entry popup banner' })
  @ApiOkResponse({ type: PopupBannerEntity })
  findActive() {
    return this.popupBannerService.findActive();
  }

  @Post()
  @ApiOperation({ summary: 'Create a popup banner' })
  @ApiCreatedResponse({ type: PopupBannerEntity })
  @ApiUnprocessableEntityResponse({ description: 'Invalid banner payload.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreatePopupBannerDto) {
    return this.popupBannerService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all popup banners' })
  @ApiOkResponse({ type: PopupBannerEntity, isArray: true })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.popupBannerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a popup banner by ID' })
  @ApiOkResponse({ type: PopupBannerEntity })
  @ApiNotFoundResponse({ description: 'Popup banner not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.popupBannerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a popup banner' })
  @ApiOkResponse({ type: PopupBannerEntity })
  @ApiNotFoundResponse({ description: 'Popup banner not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdatePopupBannerDto) {
    return this.popupBannerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a popup banner' })
  @ApiOkResponse({ description: 'Popup banner deleted.' })
  @ApiNotFoundResponse({ description: 'Popup banner not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.popupBannerService.remove(id);
  }
}
