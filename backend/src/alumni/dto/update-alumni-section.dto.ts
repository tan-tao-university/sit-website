import { PartialType } from '@nestjs/swagger';
import { CreateAlumniSectionDto } from './create-alumni-section.dto';

export class UpdateAlumniSectionDto extends PartialType(
  CreateAlumniSectionDto,
) {}
