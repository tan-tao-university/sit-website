import { ApiProperty } from '@nestjs/swagger';
import { CreatePopupBannerDto } from '../dto/create-popup-banner.dto';

export class PopupBannerEntity extends CreatePopupBannerDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
