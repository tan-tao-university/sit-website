import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import { program, content, contentTranslation } from '../../db/schema';
import { eq, and, ne, SQL } from 'drizzle-orm';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class ProgramService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  async create(createProgramDto: CreateProgramDto) {
    const { content: contentData, ...programData } = createProgramDto;

    // Program code is user-entered, so a collision is still reported as an error
    const duplicates = await this.checkDuplicates({
      code: programData.code,
    });

    if (duplicates.length > 0) {
      const field = duplicates[0]; // Return first duplicate found
      const parsedError = {
        field,
        constraint: `program_${field}_unique`,
        value: programData[field as keyof typeof programData],
        message: `Duplicate ${field} detected. This value already exists.`,
      };

      throw new ConflictException({
        message: parsedError.message,
        field: parsedError.field,
        constraint: parsedError.constraint,
        value: parsedError.value,
      });
    }

    // Slugs are auto-generated and hidden from the user, so auto-dedupe them
    if (programData.slugVi) {
      programData.slugVi = await generateUniqueSlug(
        programData.slugVi,
        async (slugVi) => (await this.checkDuplicates({ slugVi })).length > 0,
      );
    }
    if (programData.slugEn) {
      programData.slugEn = await generateUniqueSlug(
        programData.slugEn,
        async (slugEn) => (await this.checkDuplicates({ slugEn })).length > 0,
      );
    }

    try {
      const { newContent, newProgram } = await db.transaction(async (tx) => {
        const [createdContent] = await tx
          .insert(content)
          .values({
            document: contentData,
            baseLanguage: 'vi',
          })
          .returning();
        const [createdProgram] = await tx
          .insert(program)
          .values({
            ...programData,
            contentId: createdContent.contentId,
          })
          .returning();
        return { newContent: createdContent, newProgram: createdProgram };
      });

      return { ...newProgram, content: newContent };
    } catch (error) {
      // Fallback: Handle unique constraint violation if check missed something
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

  /**
   * Check for duplicate values in unique fields
   * @param fields - Object with field names and values to check
   * @returns Array of field names that have duplicates
   */
  private async checkDuplicates(fields: {
    code?: string;
    slugVi?: string;
    slugEn?: string;
    excludeId?: string; // For update operations
  }): Promise<string[]> {
    const duplicateFields: string[] = [];

    // Check code
    if (fields.code) {
      const conditions = [eq(program.code, fields.code)];
      if (fields.excludeId) {
        conditions.push(ne(program.programId, fields.excludeId));
      }

      const existing = await db
        .select()
        .from(program)
        .where(and(...conditions))
        .limit(1);

      if (existing.length > 0) {
        duplicateFields.push('code');
      }
    }

    // Check slugVi
    if (fields.slugVi) {
      const conditions = [eq(program.slugVi, fields.slugVi)];
      if (fields.excludeId) {
        conditions.push(ne(program.programId, fields.excludeId));
      }

      const existing = await db
        .select()
        .from(program)
        .where(and(...conditions))
        .limit(1);

      if (existing.length > 0) {
        duplicateFields.push('slugVi');
      }
    }

    // Check slugEn
    if (fields.slugEn) {
      const conditions = [eq(program.slugEn, fields.slugEn)];
      if (fields.excludeId) {
        conditions.push(ne(program.programId, fields.excludeId));
      }

      const existing = await db
        .select()
        .from(program)
        .where(and(...conditions))
        .limit(1);

      if (existing.length > 0) {
        duplicateFields.push('slugEn');
      }
    }

    return duplicateFields;
  }

  async findAll(status?: string, level?: string) {
    let query = db.select().from(program);

    // Apply filters if provided
    const conditions: SQL<unknown>[] = [];
    if (status) {
      conditions.push(eq(program.status, status));
    }
    if (level) {
      conditions.push(eq(program.level, level));
    }

    if (conditions.length > 0) {
      // Use 'and' to combine multiple conditions
      // @ts-expect-error Drizzle's .where() narrows the builder type, which isn't assignable back to `query`'s pre-where type.
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async findOne(id: string) {
    const [result] = await db
      .select({
        program: program,
        content: content,
      })
      .from(program)
      .leftJoin(content, eq(program.contentId, content.contentId))
      .where(eq(program.programId, id));

    if (!result) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    // Flatten logic if preferred, or return structured
    return {
      ...result.program,
      content: result.content?.document || {},
      contentId: result.program.contentId,
    };
  }

  async update(id: string, updateProgramDto: UpdateProgramDto) {
    const { content: contentData, ...programData } = updateProgramDto;

    const existing = await this.findOne(id);

    // Check for duplicates before attempting update (excluding current record)
    if (Object.keys(programData).length > 0) {
      const duplicates = await this.checkDuplicates({
        code: programData.code,
        slugVi: programData.slugVi,
        slugEn: programData.slugEn,
        excludeId: id, // Exclude current record from duplicate check
      });

      if (duplicates.length > 0) {
        const field = duplicates[0];
        const parsedError = {
          field,
          constraint: `program_${field}_unique`,
          value: programData[field as keyof typeof programData],
          message: `Duplicate ${field} detected. This value already exists.`,
        };

        throw new ConflictException({
          message: parsedError.message,
          field: parsedError.field,
          constraint: parsedError.constraint,
          value: parsedError.value,
        });
      }
    }

    // 1. Update content if provided
    if (contentData) {
      await db
        .update(content)
        .set({
          document: contentData,
          updatedAt: new Date(),
        })
        .where(eq(content.contentId, existing.contentId));
    }

    // 2. Update program fields
    if (Object.keys(programData).length > 0) {
      try {
        const [updated] = await db
          .update(program)
          .set(programData)
          .where(eq(program.programId, id))
          .returning();
        const current = await this.findOne(id);
        await this.uploadCleanup.cleanupReplaced(existing, current);
        return updated;
      } catch (error) {
        // Fallback: Handle unique constraint violation if check missed something
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

    const current = await this.findOne(id);
    await this.uploadCleanup.cleanupReplaced(existing, current);
    return existing;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const deleted = await db.transaction(async (tx) => {
      const [deletedProgram] = await tx
        .delete(program)
        .where(eq(program.programId, id))
        .returning();

      if (!deletedProgram) return undefined;

      const [otherOwner] = await tx
        .select({ id: program.programId })
        .from(program)
        .where(eq(program.contentId, deletedProgram.contentId))
        .limit(1);
      if (!otherOwner) {
        await tx
          .delete(contentTranslation)
          .where(eq(contentTranslation.contentId, deletedProgram.contentId));
        await tx
          .delete(content)
          .where(eq(content.contentId, deletedProgram.contentId));
      }
      return deletedProgram;
    });

    if (!deleted) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupDeleted(existing);
    return deleted;
  }

  async findBySlug(slug: string, locale: 'vi' | 'en' = 'vi') {
    const slugColumn = locale === 'vi' ? program.slugVi : program.slugEn;
    const [result] = await db
      .select({
        program: program,
        content: content,
      })
      .from(program)
      .leftJoin(content, eq(program.contentId, content.contentId))
      .where(eq(slugColumn, slug));

    if (!result) {
      throw new NotFoundException(`Program with slug ${slug} not found`);
    }

    return {
      ...result.program,
      content: result.content?.document || {},
    };
  }
}
