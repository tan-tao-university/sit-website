import { ApiProperty } from '@nestjs/swagger';

export class FacultyAcademicTimelineEntity {
  @ApiProperty() id: string;
  @ApiProperty() facultyId: string;
  @ApiProperty({ required: false }) degree?: string;
  @ApiProperty({ required: false }) field?: string;
  @ApiProperty({ required: false }) institution?: string;
  @ApiProperty({ required: false }) country?: string;
  @ApiProperty({ required: false }) startYear?: number;
  @ApiProperty({ required: false }) endYear?: number;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) displayOrder?: number;
}

export class FacultyResearchAreaEntity {
  @ApiProperty() id: string;
  @ApiProperty() facultyId: string;
  @ApiProperty({ required: false }) title?: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) displayOrder?: number;
}

export class FacultyPublicationEntity {
  @ApiProperty() id: string;
  @ApiProperty() facultyId: string;
  @ApiProperty({ required: false }) title?: string;
  @ApiProperty({ required: false }) venue?: string;
  @ApiProperty({ required: false }) year?: number;
  @ApiProperty({ required: false }) publicationType?: string;
  @ApiProperty({ required: false }) doi?: string;
  @ApiProperty({ required: false }) publisherUrl?: string;
  @ApiProperty({ required: false }) displayOrder?: number;
}

export class FacultyCourseEntity {
  @ApiProperty() id: string;
  @ApiProperty() facultyId: string;
  @ApiProperty() courseId: string;
}

export class FacultyContactEntity {
  @ApiProperty() id: string;
  @ApiProperty() facultyId: string;
  @ApiProperty({ required: false }) type?: string;
  @ApiProperty({ required: false }) value?: string;
  @ApiProperty({ required: false }) visibility?: string;
}

export class FacultyMetaEntity {
  @ApiProperty() facultyId: string;
  @ApiProperty({ required: false }) profileVisibility?: string;
  @ApiProperty({ required: false }) lastUpdatedAt?: Date;
  @ApiProperty({ required: false }) updatedBy?: string;
}

export class FacultyEntity {
  @ApiProperty() id: string;
  @ApiProperty() slug: string;
  @ApiProperty() fullName: string;
  @ApiProperty({ required: false }) avatarUrl?: string;
  @ApiProperty({ required: false }) academicTitle?: string;
  @ApiProperty({ required: false }) position?: string;
  @ApiProperty({ required: false }) department?: string;
  @ApiProperty({ required: false }) quote?: string;
  @ApiProperty({ required: false }) bioShort?: string;
  @ApiProperty({ required: false }) isActive?: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  @ApiProperty({ type: () => [FacultyAcademicTimelineEntity], required: false })
  academicTimeline?: FacultyAcademicTimelineEntity[];

  @ApiProperty({ type: () => [FacultyResearchAreaEntity], required: false })
  researchAreas?: FacultyResearchAreaEntity[];

  @ApiProperty({ type: () => [FacultyPublicationEntity], required: false })
  publications?: FacultyPublicationEntity[];

  @ApiProperty({ type: () => [FacultyCourseEntity], required: false })
  courses?: FacultyCourseEntity[];

  @ApiProperty({ type: () => [FacultyContactEntity], required: false })
  contacts?: FacultyContactEntity[];

  @ApiProperty({ type: () => FacultyMetaEntity, required: false })
  meta?: FacultyMetaEntity;
}
