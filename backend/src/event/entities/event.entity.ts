import { ApiProperty } from '@nestjs/swagger';
import { CreateEventDto } from '../dto/create-event.dto';

export class EventEntity extends CreateEventDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
