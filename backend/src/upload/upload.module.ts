import { Global, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { UploadCleanupService } from './upload-cleanup.service';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService, UploadCleanupService],
  exports: [UploadService, UploadCleanupService],
})
export class UploadModule {}
