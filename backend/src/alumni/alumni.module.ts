import { Module } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { AlumniController } from './alumni.controller';
import { AlumniSectionService } from './alumni-section.service';
import { AlumniSectionController } from './alumni-section.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AlumniController, AlumniSectionController],
  providers: [AlumniService, AlumniSectionService],
  exports: [AlumniService, AlumniSectionService],
})
export class AlumniModule {}
