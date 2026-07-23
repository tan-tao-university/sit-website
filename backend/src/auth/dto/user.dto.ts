import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsAppUrl } from '../../common/decorators/is-app-url.decorator';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@sit.edu.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Administrator' })
  @IsString()
  fullName: string;

  @ApiProperty({ minLength: 12, example: 'ChangeMe123!' })
  @IsString()
  @MinLength(12)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@sit.edu.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 12, example: 'ChangeMe123!' })
  @IsString()
  @MinLength(12)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Opaque refresh token returned during login' })
  @IsString()
  refreshToken: string;
}

export class AssignRoleDto {
  @ApiProperty({ enum: ['admin', 'student', 'parent'], example: 'admin' })
  @IsIn(['admin', 'student', 'parent'])
  role: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Updated Administrator' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsAppUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ minLength: 12, example: 'NewPassword123!' })
  @IsString()
  @MinLength(12)
  @IsOptional()
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'admin@sit.edu.vn' })
  email: string;

  @ApiProperty({ example: 'Administrator' })
  fullName: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl?: string | null;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ type: [String], example: ['admin'] })
  roles?: string[];

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  lastLoginAt?: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  createdAt?: Date | null;
}

export class CreateUserResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class AuthSessionResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: 900 })
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ enum: ['admin', 'student', 'parent'] })
  role: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  assignedAt?: Date | null;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}
