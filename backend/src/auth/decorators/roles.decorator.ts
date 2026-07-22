import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required roles for a route
 * Usage: @Roles('admin', 'student')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
