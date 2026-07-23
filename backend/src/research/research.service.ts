import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import { research } from '../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class ResearchService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  /**
   * Check for duplicate values in unique fields
   */
  private async checkDuplicates(fields: {
    slug?: string;
    excludeId?: string;
  }): Promise<string[]> {
    const duplicateFields: string[] = [];

    // Check slug
    if (fields.slug) {
      const conditions = [eq(research.slug, fields.slug)];
      if (fields.excludeId) {
        conditions.push(ne(research.id, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(research)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slug');
      }
    }

    return duplicateFields;
  }

  async create(createResearchDto: CreateResearchDto) {
    // Slug is auto-generated and hidden from the user, so auto-dedupe it
    if (createResearchDto.slug) {
      createResearchDto.slug = await generateUniqueSlug(
        createResearchDto.slug,
        async (slug) => (await this.checkDuplicates({ slug })).length > 0,
      );
    }

    try {
      const [newResearch] = await db
        .insert(research)
        .values({
          ...createResearchDto,
          updatedAt: new Date(),
        })
        .returning();

      return newResearch;
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

  async findAll(type?: string) {
    if (type) {
      return await db
        .select()
        .from(research)
        .where(eq(research.type, type))
        .orderBy(research.createdAt);
    }

    return await db.select().from(research).orderBy(research.createdAt);
  }

  async findOne(id: string) {
    const [result] = await db
      .select()
      .from(research)
      .where(eq(research.id, id));

    if (!result) {
      throw new NotFoundException(`Research with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, updateResearchDto: UpdateResearchDto) {
    // Check existence first
    const [existing] = await db
      .select()
      .from(research)
      .where(eq(research.id, id));

    if (!existing) {
      throw new NotFoundException(`Research with ID ${id} not found`);
    }

    // Check for duplicates before attempting update (excluding current record)
    if (updateResearchDto.slug) {
      const duplicates = await this.checkDuplicates({
        slug: updateResearchDto.slug,
        excludeId: id,
      });

      if (duplicates.length > 0) {
        const field = duplicates[0];
        throw new ConflictException({
          message: `Duplicate ${field} detected. This value already exists.`,
          field,
          constraint: `research_${field}_unique`,
          value: updateResearchDto[field as keyof typeof updateResearchDto],
        });
      }
    }

    try {
      const [updated] = await db
        .update(research)
        .set({
          ...updateResearchDto,
          updatedAt: new Date(),
        })
        .where(eq(research.id, id))
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
      .delete(research)
      .where(eq(research.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Research with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupDeleted(deleted);
    return { message: 'Research deleted successfully' };
  }
}
