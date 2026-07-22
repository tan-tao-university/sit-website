import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAdminAuth() {
  return applyDecorators(
    ApiBearerAuth('bearer-auth'),
    ApiUnauthorizedResponse({
      description: 'Missing, invalid, or expired access token.',
    }),
    ApiForbiddenResponse({
      description: 'The authenticated user does not have the admin role.',
    }),
  );
}
