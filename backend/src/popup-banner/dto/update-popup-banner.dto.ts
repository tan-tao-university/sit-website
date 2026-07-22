import { PartialType } from '@nestjs/swagger';
import { CreatePopupBannerDto } from './create-popup-banner.dto';

export class UpdatePopupBannerDto extends PartialType(CreatePopupBannerDto) {}
