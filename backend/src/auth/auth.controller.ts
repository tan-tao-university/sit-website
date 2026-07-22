import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import {
  AssignRoleDto,
  AuthSessionResponseDto,
  CreateUserDto,
  CreateUserResponseDto,
  LoginDto,
  MessageResponseDto,
  RefreshTokenDto,
  RoleResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with email and password',
    description:
      'Returns a short-lived access token and a rotating refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue a new session' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshSession(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiResponse({ status: 204, description: 'Session revoked' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      "Returns the current authenticated user's profile from the database",
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() currentUser: { sub: string }) {
    const dbUser = await this.authService.getUserById(currentUser.sub);

    if (!dbUser) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      userId: dbUser.userId,
      email: dbUser.email,
      fullName: dbUser.fullName,
      avatarUrl: dbUser.avatarUrl,
      emailVerified: dbUser.emailVerified,
      isActive: dbUser.isActive,
      roles: dbUser.roles || [],
      lastLoginAt: dbUser.lastLoginAt,
      createdAt: dbUser.createdAt,
    };
  }
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('bearer-auth')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users (Admin only)',
    description: 'Returns all users and their assigned roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getUsers() {
    return this.authService.getUsers();
  }

  @Post()
  @ApiOperation({
    summary: 'Create user (Admin only)',
    description:
      'Creates a local email/password user with a scrypt password hash',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  @ApiResponse({ status: 422, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID (Admin only)',
    description: 'Returns a specific user by their database ID',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Database user ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Post(':id/roles')
  @ApiOperation({
    summary: 'Assign role to user (Admin only)',
    description: 'Assigns a role (admin, student, or parent) to a user',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Database user ID' })
  @ApiResponse({
    status: 201,
    description: 'Role assigned successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 422, description: 'Invalid role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async assignRole(
    @Param('id') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.authService.assignRole(userId, assignRoleDto.role);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user (Admin only)',
    description: 'Updates user information',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Database user ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 422, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user (Admin only)',
    description: 'Deletes a user from the database',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Database user ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteUser(@Param('id') userId: string) {
    await this.authService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove role from user (Admin only)',
    description: 'Removes a specific role from a user',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Database user ID' })
  @ApiParam({ name: 'roleId', format: 'uuid', description: 'User role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role removed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async removeRole(@Param('roleId') roleId: string) {
    await this.authService.removeRole(roleId);
    return { message: 'Role removed successfully' };
  }
}
