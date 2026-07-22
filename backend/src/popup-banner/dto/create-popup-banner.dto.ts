import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePopupBannerDto {
  @ApiProperty({ description: 'Vietnamese campaign title', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleVi: string;

  @ApiPropertyOptional({
    description: 'English campaign title',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  titleEn?: string;

  @ApiProperty({ description: 'Uploaded banner image URL' })
  @IsUrl({ require_tld: false })
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Vietnamese image alternative text' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageAltVi?: string;

  @ApiPropertyOptional({ description: 'English image alternative text' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageAltEn?: string;

  @ApiProperty({
    description: 'Internal route beginning with / or an absolute HTTP(S) URL',
    example: '/vi/tuyen-sinh',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(https?:\/\/|\/)/, {
    message: 'linkUrl must be an internal route or an HTTP(S) URL',
  })
  linkUrl: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  @IsISO8601()
  @IsOptional()
  startsAt?: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  @IsISO8601()
  @IsOptional()
  endsAt?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
