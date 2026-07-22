import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import {
  faculty,
  facultyAcademicTimeline,
  facultyResearchArea,
  facultyPublication,
  facultyCourse,
  facultyContact,
  facultyMeta,
} from '../../db/schema';
import { eq, desc, and, ne, asc } from 'drizzle-orm';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class FacultyService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  /**
   * Check for duplicate values in unique fields
   */
  private async checkDuplicates(fields: {
    slug?: string;
    excludeId?: string;
  }): Promise<string[]> {
    const duplicateFields: string[] = [];

    if (fields.slug) {
      const conditions = [eq(faculty.slug, fields.slug)];
      if (fields.excludeId) {
        conditions.push(ne(faculty.id, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(faculty)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slug');
      }
    }

    return duplicateFields;
  }

  async create(createFacultyDto: CreateFacultyDto) {
    const {
      academicTimeline,
      researchAreas,
      publications,
      courses,
      contacts,
      meta,
      ...facultyData
    } = createFacultyDto;

    // Auto-dedupe the slug instead of rejecting the request
    if (facultyData.slug) {
      facultyData.slug = await generateUniqueSlug(
        facultyData.slug,
        async (slug) => (await this.checkDuplicates({ slug })).length > 0,
      );
    }

    let newFaculty: typeof faculty.$inferSelect;
    try {
      [newFaculty] = await db.insert(faculty).values(facultyData).returning();
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        const parsedError = parseDuplicateKeyError(error);
        throw new ConflictException({
          message: parsedError.message,
          field: parsedError.field,
          constraint: parsedError.constraint,
          value: parsedError.value,
        });
      }
      throw error;
    }

    const id = newFaculty.id;

    // Create Academic Timeline
    if (academicTimeline && academicTimeline.length > 0) {
      await db.insert(facultyAcademicTimeline).values(
        academicTimeline.map((item) => ({
          facultyId: id,
          ...item,
        })),
      );
    }

    // Create Research Areas
    if (researchAreas && researchAreas.length > 0) {
      await db.insert(facultyResearchArea).values(
        researchAreas.map((item) => ({
          facultyId: id,
          ...item,
        })),
      );
    }

    // Create Publications
    if (publications && publications.length > 0) {
      await db.insert(facultyPublication).values(
        publications.map((item) => ({
          facultyId: id,
          ...item,
        })),
      );
    }

    // Create Course Links
    if (courses && courses.length > 0) {
      await db.insert(facultyCourse).values(
        courses.map((item) => ({
          facultyId: id,
          courseId: item.courseId,
        })),
      );
    }

    // Create Contacts
    if (contacts && contacts.length > 0) {
      await db.insert(facultyContact).values(
        contacts.map((item) => ({
          facultyId: id,
          ...item,
        })),
      );
    }

    // Create Meta
    if (meta) {
      await db.insert(facultyMeta).values({
        facultyId: id,
        ...meta,
        lastUpdatedAt: new Date(),
      });
    }

    return await this.findOne(id);
  }

  async findAll() {
    return await db.query.faculty.findMany({
      orderBy: desc(faculty.createdAt),
      with: {
        academicTimeline: true,
        researchAreas: true,
        publications: true,
        courses: {
          with: {
            course: true,
          },
        },
        contacts: true,
        meta: true,
      },
    });
  }

  async findOne(id: string) {
    const [result] = await db.select().from(faculty).where(eq(faculty.id, id));

    if (!result) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }

    // Fetch related data
    const academicTimeline = await db
      .select()
      .from(facultyAcademicTimeline)
      .where(eq(facultyAcademicTimeline.facultyId, id))
      .orderBy(asc(facultyAcademicTimeline.displayOrder));

    const researchAreas = await db
      .select()
      .from(facultyResearchArea)
      .where(eq(facultyResearchArea.facultyId, id))
      .orderBy(asc(facultyResearchArea.displayOrder));

    const publications = await db
      .select()
      .from(facultyPublication)
      .where(eq(facultyPublication.facultyId, id))
      .orderBy(asc(facultyPublication.displayOrder));

    const courses = await db.query.facultyCourse.findMany({
      where: eq(facultyCourse.facultyId, id),
      with: {
        course: true,
      },
    });

    const contacts = await db
      .select()
      .from(facultyContact)
      .where(eq(facultyContact.facultyId, id));

    const meta = await db
      .select()
      .from(facultyMeta)
      .where(eq(facultyMeta.facultyId, id));

    return {
      ...result,
      academicTimeline,
      researchAreas,
      publications,
      courses,
      contacts,
      meta: meta[0] || null,
    };
  }

  async findBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(faculty)
      .where(eq(faculty.slug, slug));

    if (!result) {
      throw new NotFoundException(`Faculty with slug ${slug} not found`);
    }

    return await this.findOne(result.id);
  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto) {
    const {
      academicTimeline,
      researchAreas,
      publications,
      courses,
      contacts,
      meta,
      ...facultyData
    } = updateFacultyDto;

    // Check existence first
    const [existing] = await db
      .select()
      .from(faculty)
      .where(eq(faculty.id, id));
    if (!existing) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }

    // Check for duplicates before attempting update (excluding current record)
    if (facultyData.slug) {
      const duplicates = await this.checkDuplicates({
        slug: facultyData.slug,
        excludeId: id,
      });

      if (duplicates.length > 0) {
        const field = duplicates[0];
        throw new ConflictException({
          message: `Duplicate ${field} detected. This value already exists.`,
          field,
          constraint: `faculty_${field}_unique`,
          value: facultyData[field as keyof typeof facultyData],
        });
      }
    }

    try {
      await db
        .update(faculty)
        .set({ ...facultyData, updatedAt: new Date() })
        .where(eq(faculty.id, id))
        .returning();
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        const parsedError = parseDuplicateKeyError(error);
        throw new ConflictException({
          message: parsedError.message,
          field: parsedError.field,
          constraint: parsedError.constraint,
          value: parsedError.value,
        });
      }
      throw error;
    }

    // Update Academic Timeline (Replace strategy)
    if (academicTimeline) {
      await db
        .delete(facultyAcademicTimeline)
        .where(eq(facultyAcademicTimeline.facultyId, id));
      if (academicTimeline.length > 0) {
        await db.insert(facultyAcademicTimeline).values(
          academicTimeline.map((item) => ({
            facultyId: id,
            ...item,
          })),
        );
      }
    }

    // Update Research Areas (Replace strategy)
    if (researchAreas) {
      await db
        .delete(facultyResearchArea)
        .where(eq(facultyResearchArea.facultyId, id));
      if (researchAreas.length > 0) {
        await db.insert(facultyResearchArea).values(
          researchAreas.map((item) => ({
            facultyId: id,
            ...item,
          })),
        );
      }
    }

    // Update Publications (Replace strategy)
    if (publications) {
      await db
        .delete(facultyPublication)
        .where(eq(facultyPublication.facultyId, id));
      if (publications.length > 0) {
        await db.insert(facultyPublication).values(
          publications.map((item) => ({
            facultyId: id,
            ...item,
          })),
        );
      }
    }

    // Update Courses (Replace strategy)
    if (courses) {
      await db.delete(facultyCourse).where(eq(facultyCourse.facultyId, id));
      if (courses.length > 0) {
        await db.insert(facultyCourse).values(
          courses.map((item) => ({
            facultyId: id,
            courseId: item.courseId,
          })),
        );
      }
    }

    // Update Contacts (Replace strategy)
    if (contacts) {
      await db.delete(facultyContact).where(eq(facultyContact.facultyId, id));
      if (contacts.length > 0) {
        await db.insert(facultyContact).values(
          contacts.map((item) => ({
            facultyId: id,
            ...item,
          })),
        );
      }
    }

    // Update Meta (Upsert)
    if (meta) {
      const existingMeta = await db
        .select()
        .from(facultyMeta)
        .where(eq(facultyMeta.facultyId, id))
        .limit(1);

      if (existingMeta.length > 0) {
        await db
          .update(facultyMeta)
          .set({ ...meta, lastUpdatedAt: new Date() })
          .where(eq(facultyMeta.facultyId, id));
      } else {
        await db.insert(facultyMeta).values({
          facultyId: id,
          ...meta,
          lastUpdatedAt: new Date(),
        });
      }
    }

    const result = await this.findOne(id);
    await this.uploadCleanup.cleanupReplaced(existing, result);
    return result;
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(faculty)
      .where(eq(faculty.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupDeleted(deleted);
    return deleted;
  }
}
