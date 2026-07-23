import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import { curriculum, curriculumSection, program } from '../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class CurriculumService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  /**
   * Check for duplicate values in unique fields
   */
  private async checkDuplicates(fields: {
    slugVi?: string;
    slugEn?: string;
    excludeId?: string;
  }): Promise<string[]> {
    const duplicateFields: string[] = [];

    // Check slugVi
    if (fields.slugVi) {
      const conditions = [eq(curriculum.slugVi, fields.slugVi)];
      if (fields.excludeId) {
        conditions.push(ne(curriculum.curriculumId, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(curriculum)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slugVi');
      }
    }

    // Check slugEn
    if (fields.slugEn) {
      const conditions = [eq(curriculum.slugEn, fields.slugEn)];
      if (fields.excludeId) {
        conditions.push(ne(curriculum.curriculumId, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(curriculum)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slugEn');
      }
    }

    return duplicateFields;
  }

  async create(createCurriculumDto: CreateCurriculumDto) {
    // Slugs are auto-generated and hidden from the user, so auto-dedupe them
    if (createCurriculumDto.slugVi) {
      createCurriculumDto.slugVi = await generateUniqueSlug(
        createCurriculumDto.slugVi,
        async (slugVi) => (await this.checkDuplicates({ slugVi })).length > 0,
      );
    }
    if (createCurriculumDto.slugEn) {
      createCurriculumDto.slugEn = await generateUniqueSlug(
        createCurriculumDto.slugEn,
        async (slugEn) => (await this.checkDuplicates({ slugEn })).length > 0,
      );
    }

    try {
      const [newCurriculum] = await db
        .insert(curriculum)
        .values(createCurriculumDto)
        .returning();
      return newCurriculum;
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

  async findAll(programId?: string) {
    if (programId) {
      return await db
        .select()
        .from(curriculum)
        .where(eq(curriculum.programId, programId));
    }
    return await db.select().from(curriculum);
  }

  async findOne(id: string, includeSections = false) {
    const [result] = await db
      .select()
      .from(curriculum)
      .where(eq(curriculum.curriculumId, id));

    if (!result) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    if (includeSections) {
      const sections = await db
        .select()
        .from(curriculumSection)
        .where(eq(curriculumSection.curriculumId, id))
        .orderBy(curriculumSection.displayOrder);

      return {
        ...result,
        sections,
      };
    }

    return result;
  }

  async findCurrentByProgram(programId: string) {
    const [result] = await db
      .select()
      .from(curriculum)
      .where(
        and(
          eq(curriculum.programId, programId),
          eq(curriculum.isCurrent, true),
        ),
      );

    if (!result) {
      throw new NotFoundException(
        `No current curriculum found for program ${programId}`,
      );
    }

    // Include sections
    const sections = await db
      .select()
      .from(curriculumSection)
      .where(eq(curriculumSection.curriculumId, result.curriculumId))
      .orderBy(curriculumSection.displayOrder);

    return {
      ...result,
      sections,
    };
  }

  async update(id: string, updateCurriculumDto: UpdateCurriculumDto) {
    // Check existence first
    const [existing] = await db
      .select()
      .from(curriculum)
      .where(eq(curriculum.curriculumId, id));

    if (!existing) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    // Check for duplicates before attempting update (excluding current record)
    if (Object.keys(updateCurriculumDto).length > 0) {
      const duplicates = await this.checkDuplicates({
        slugVi: updateCurriculumDto.slugVi,
        slugEn: updateCurriculumDto.slugEn,
        excludeId: id,
      });

      if (duplicates.length > 0) {
        const field = duplicates[0];
        throw new ConflictException({
          message: `Duplicate ${field} detected. This value already exists.`,
          field,
          constraint: `curriculum_${field}_unique`,
          value: updateCurriculumDto[field as keyof typeof updateCurriculumDto],
        });
      }
    }

    try {
      const [updated] = await db
        .update(curriculum)
        .set(updateCurriculumDto)
        .where(eq(curriculum.curriculumId, id))
        .returning();

      await this.uploadCleanup.cleanupReplaced(existing, updated);
      return updated;
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
    const [deleted] = await db
      .delete(curriculum)
      .where(eq(curriculum.curriculumId, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupDeleted(deleted);
    return deleted;
  }

  async findByProgramSlugAndCurriculumSlug(
    programSlug: string,
    curriculumSlug: string,
    locale: 'vi' | 'en' = 'vi',
  ) {
    // First, find the program by slug
    const slugColumn = locale === 'vi' ? program.slugVi : program.slugEn;
    const [programResult] = await db
      .select()
      .from(program)
      .where(eq(slugColumn, programSlug));

    if (!programResult) {
      throw new NotFoundException(`Program with slug ${programSlug} not found`);
    }

    // Then find the curriculum by program ID and curriculum slug
    const curriculumSlugColumn =
      locale === 'vi' ? curriculum.slugVi : curriculum.slugEn;
    const [curriculumResult] = await db
      .select()
      .from(curriculum)
      .where(
        and(
          eq(curriculum.programId, programResult.programId),
          eq(curriculumSlugColumn, curriculumSlug),
        ),
      );

    if (!curriculumResult) {
      throw new NotFoundException(
        `Curriculum with slug ${curriculumSlug} not found for program ${programSlug}`,
      );
    }

    // Include sections
    const sections = await db
      .select()
      .from(curriculumSection)
      .where(eq(curriculumSection.curriculumId, curriculumResult.curriculumId))
      .orderBy(curriculumSection.displayOrder);

    return {
      ...curriculumResult,
      program: programResult,
      sections,
    };
  }
}
