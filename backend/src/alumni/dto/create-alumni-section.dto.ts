import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAlumniSectionDto {
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  titleVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  titleEn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descriptionVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
