import { ApiProperty } from '@nestjs/swagger';
import { CreateAchievementDto } from '../dto/create-achievement.dto';

export class AchievementEntity extends CreateAchievementDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
