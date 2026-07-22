import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';

@Injectable()
export class CourseService {
  /**
   * Check for duplicate values in unique fields
   */
  private async checkDuplicates(fields: {
    code?: string;
    slugVi?: string;
    slugEn?: string;
    excludeId?: string;
  }): Promise<string[]> {
    const duplicateFields: string[] = [];

    // Check code
    if (fields.code) {
      const conditions = [eq(schema.course.code, fields.code)];
      if (fields.excludeId) {
        conditions.push(ne(schema.course.courseId, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(schema.course)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('code');
      }
    }

    // Check slugVi
    if (fields.slugVi) {
      const conditions = [eq(schema.course.slugVi, fields.slugVi)];
      if (fields.excludeId) {
        conditions.push(ne(schema.course.courseId, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(schema.course)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slugVi');
      }
    }

    // Check slugEn
    if (fields.slugEn) {
      const conditions = [eq(schema.course.slugEn, fields.slugEn)];
      if (fields.excludeId) {
        conditions.push(ne(schema.course.courseId, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(schema.course)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slugEn');
      }
    }

    return duplicateFields;
  }

  async create(createCourseDto: CreateCourseDto) {
    // Course code is user-entered, so a collision is still reported as an error
    const duplicates = await this.checkDuplicates({
      code: createCourseDto.code,
    });

    if (duplicates.length > 0) {
      const field = duplicates[0];
      throw new ConflictException({
        message: `Duplicate ${field} detected. This value already exists.`,
        field,
        constraint: `course_${field}_unique`,
        value: createCourseDto[field as keyof typeof createCourseDto],
      });
    }

    // Slugs are auto-generated and hidden from the user, so auto-dedupe them
    if (createCourseDto.slugVi) {
      createCourseDto.slugVi = await generateUniqueSlug(
        createCourseDto.slugVi,
        async (slugVi) => (await this.checkDuplicates({ slugVi })).length > 0,
      );
    }
    if (createCourseDto.slugEn) {
      createCourseDto.slugEn = await generateUniqueSlug(
        createCourseDto.slugEn,
        async (slugEn) => (await this.checkDuplicates({ slugEn })).length > 0,
      );
    }

    try {
      const course = await db
        .insert(schema.course)
        .values(createCourseDto)
        .returning();
      return course[0];
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
  }

  async findAll() {
    return db.query.course.findMany({
      orderBy: [desc(schema.course.code)],
    });
  }

  async findOne(id: string) {
    const course = await db.query.course.findFirst({
      where: eq(schema.course.courseId, id),
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);

    // Check for duplicates before attempting update (excluding current record)
    if (Object.keys(updateCourseDto).length > 0) {
      const duplicates = await this.checkDuplicates({
        code: updateCourseDto.code,
        slugVi: updateCourseDto.slugVi,
        slugEn: updateCourseDto.slugEn,
        excludeId: id,
      });

      if (duplicates.length > 0) {
        const field = duplicates[0];
        throw new ConflictException({
          message: `Duplicate ${field} detected. This value already exists.`,
          field,
          constraint: `course_${field}_unique`,
          value: updateCourseDto[field as keyof typeof updateCourseDto],
        });
      }
    }

    try {
      const updatedCourse = await db
        .update(schema.course)
        .set(updateCourseDto)
        .where(eq(schema.course.courseId, id))
        .returning();

      return updatedCourse[0];
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
  }

  async remove(id: string) {
    await this.findOne(id);

    await db.delete(schema.course).where(eq(schema.course.courseId, id));
  }
}
