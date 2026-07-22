import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import { alumniSection } from '../../db/schema';
import { eq, asc, and, ne } from 'drizzle-orm';
import { CreateAlumniSectionDto } from './dto/create-alumni-section.dto';
import { UpdateAlumniSectionDto } from './dto/update-alumni-section.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';

@Injectable()
export class AlumniSectionService {
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
      const conditions = [eq(alumniSection.slug, fields.slug)];
      if (fields.excludeId) {
        conditions.push(ne(alumniSection.id, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(alumniSection)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slug');
      }
    }

    return duplicateFields;
  }

  async create(createAlumniSectionDto: CreateAlumniSectionDto) {
    // Slug is auto-generated and hidden from the user, so auto-dedupe it
    if (createAlumniSectionDto.slug) {
      createAlumniSectionDto.slug = await generateUniqueSlug(
        createAlumniSectionDto.slug,
        async (slug) => (await this.checkDuplicates({ slug })).length > 0,
      );
    }

    try {
      const [newSection] = await db
        .insert(alumniSection)
        .values(createAlumniSectionDto)
        .returning();
      return newSection;
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
    return await db
      .select()
      .from(alumniSection)
      .orderBy(asc(alumniSection.displayOrder));
  }

  async findOne(id: string) {
    const [result] = await db
      .select()
      .from(alumniSection)
      .where(eq(alumniSection.id, id));

    if (!result) {
      throw new NotFoundException(`Alumni Section with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, updateAlumniSectionDto: UpdateAlumniSectionDto) {
    // Check existence first
    const [existing] = await db
      .select()
      .from(alumniSection)
      .where(eq(alumniSection.id, id));

    if (!existing) {
      throw new NotFoundException(`Alumni Section with ID ${id} not found`);
    }

    // Check for duplicates before attempting update (excluding current record)
    if (updateAlumniSectionDto.slug) {
      const duplicates = await this.checkDuplicates({
        slug: updateAlumniSectionDto.slug,
        excludeId: id,
      });

      if (duplicates.length > 0) {
        const field = duplicates[0];
        throw new ConflictException({
          message: `Duplicate ${field} detected. This value already exists.`,
          field,
          constraint: `alumni_section_${field}_unique`,
          value:
            updateAlumniSectionDto[
              field as keyof typeof updateAlumniSectionDto
            ],
        });
      }
    }

    try {
      const [updated] = await db
        .update(alumniSection)
        .set(updateAlumniSectionDto)
        .where(eq(alumniSection.id, id))
        .returning();

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
      .delete(alumniSection)
      .where(eq(alumniSection.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Alumni Section with ID ${id} not found`);
    }

    return deleted;
  }
}
