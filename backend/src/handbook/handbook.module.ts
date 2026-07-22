import { Module } from '@nestjs/common';
import { HandbookController } from './handbook.controller';
import { HandbookService } from './handbook.service';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [AuthModule, UploadModule],
  controllers: [HandbookController],
  providers: [HandbookService],
  exports: [HandbookService],
})
export class HandbookModule {}
