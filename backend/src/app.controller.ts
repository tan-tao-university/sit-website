import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRootResponseDto } from './app.dto';

@ApiTags('system')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get API status and documentation links' })
  @ApiOkResponse({ type: ApiRootResponseDto })
  getRoot(): ApiRootResponseDto {
    return {
      name: 'SIT Backend API',
      status: 'ok',
      api: '/api/v1',
      documentation: '/api/docs',
    };
  }
}
