import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PopupBannerController } from './popup-banner.controller';
import { PopupBannerService } from './popup-banner.service';

@Module({
  imports: [AuthModule],
  controllers: [PopupBannerController],
  providers: [PopupBannerService],
})
export class PopupBannerModule {}
