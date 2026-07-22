import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { HandbookService } from './handbook.service';
import { CreateHandbookDto, UpdateHandbookDto } from './dto/handbook.dto';
import { HandbookEntity } from './entities/handbook.entity';
import { UploadService } from '../upload/upload.service';
import { pdfBufferToHtml } from './handbook-extract.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiAdminAuth } from '../common/decorators/api-admin-auth.decorator';

@ApiTags('handbook')
@Controller('handbook')
export class HandbookController {
  constructor(
    private readonly handbookService: HandbookService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a handbook edition' })
  @ApiCreatedResponse({ type: HandbookEntity })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateHandbookDto) {
    return this.handbookService.create(dto);
  }

  @Post('extract')
  @ApiOperation({
    summary: 'Upload a PDF, store it on R2, and return extracted HTML',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'lang', required: false, example: 'vi' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async extract(
    @UploadedFile() file: Express.Multer.File,
    @Query('lang') lang = 'vi',
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }
    this.uploadService.validateFileSize(file, 20); // 20MB limit

    const pdfUrl = await this.uploadService.uploadFile(
      file,
      `handbook/${lang}`,
    );
    const html = await pdfBufferToHtml(file.buffer);
    return { pdfUrl, html };
  }

  @Get()
  @ApiOperation({ summary: 'List handbook editions' })
  @ApiQuery({
    name: 'all',
    required: false,
    description: 'Include drafts (admin dashboard)',
  })
  @ApiOkResponse({ type: HandbookEntity, isArray: true })
  findAll(@Query('all') all?: string) {
    return this.handbookService.findAll(all !== 'true');
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current published handbook' })
  @ApiOkResponse({ type: HandbookEntity })
  @ApiNotFoundResponse({ description: 'No published handbook.' })
  findCurrent() {
    return this.handbookService.findCurrent();
  }

  @Get('year/:schoolYear')
  @ApiOperation({ summary: 'Get a handbook edition by school year' })
  @ApiParam({ name: 'schoolYear', example: '2023-2024' })
  @ApiOkResponse({ type: HandbookEntity })
  @ApiNotFoundResponse({ description: 'Handbook not found.' })
  findByYear(@Param('schoolYear') schoolYear: string) {
    return this.handbookService.findByYear(schoolYear);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a handbook edition by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: HandbookEntity })
  @ApiNotFoundResponse({ description: 'Handbook not found.' })
  findOne(@Param('id') id: string) {
    return this.handbookService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a handbook edition' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: HandbookEntity })
  @ApiNotFoundResponse({ description: 'Handbook not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateHandbookDto) {
    return this.handbookService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a handbook edition' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: HandbookEntity })
  @ApiNotFoundResponse({ description: 'Handbook not found.' })
  @ApiAdminAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.handbookService.remove(id);
  }
}
