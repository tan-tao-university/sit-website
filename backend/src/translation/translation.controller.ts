import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { TranslationService } from './translation.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TranslationResponseDto } from './dto/translation-response.dto';

@ApiTags('translation')
@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  @ApiOperation({ summary: 'Translate text to Vietnamese or English' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Welcome to SIT' },
        targetLanguage: { type: 'string', enum: ['vi', 'en'], example: 'vi' },
      },
      required: ['text', 'targetLanguage'],
    },
  })
  @ApiOkResponse({
    description: 'Translated text',
    type: TranslationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Text is missing or targetLanguage is not vi/en.',
  })
  async translate(
    @Body('text') text: string,
    @Body('targetLanguage') targetLanguage: 'vi' | 'en',
  ) {
    if (!text) {
      throw new BadRequestException('Text is required');
    }
    if (!['vi', 'en'].includes(targetLanguage)) {
      throw new BadRequestException('Target language must be "vi" or "en"');
    }

    const translatedText = await this.translationService.translate(
      text,
      targetLanguage,
    );
    return { translatedText };
  }
}
