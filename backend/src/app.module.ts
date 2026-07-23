import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProgramModule } from './program/program.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { SectionModule } from './section/section.module';
import { CourseModule } from './course/course.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';

import { TranslationModule } from './translation/translation.module';
import { SearchModule } from './search/search.module';
import { NewsModule } from './news/news.module';
import { ResearchModule } from './research/research.module';
import { AchievementModule } from './achievement/achievement.module';
import { AlumniModule } from './alumni/alumni.module';
import { StudentPortfolioModule } from './student-portfolio/student-portfolio.module';
import { FacultyModule } from './faculty/faculty.module';
import { EventModule } from './event/event.module';
import { PopupBannerModule } from './popup-banner/popup-banner.module';
import { HandbookModule } from './handbook/handbook.module';
import { CareerOpportunityModule } from './career-opportunity/career-opportunity.module';
import { AppController } from './app.controller';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ProgramModule,
    CurriculumModule,
    SectionModule,
    CourseModule,
    AuthModule,
    UploadModule,
    TranslationModule,
    SearchModule,
    NewsModule,
    ResearchModule,
    AchievementModule,
    AlumniModule,
    StudentPortfolioModule,
    FacultyModule,
    EventModule,
    PopupBannerModule,
    HandbookModule,
    CareerOpportunityModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
