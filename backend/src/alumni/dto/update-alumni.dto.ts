import { PartialType } from '@nestjs/swagger';
import { CreateAlumniDto } from './create-alumni.dto';

export class UpdateAlumniDto extends PartialType(CreateAlumniDto) {}
