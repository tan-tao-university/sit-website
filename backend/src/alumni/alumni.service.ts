import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import {
  alumni,
  alumniAcademicProfile,
  alumniCareer,
  alumniAchievement,
  alumniSectionMember,
  alumniContact,
  alumniMeta,
} from '../../db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class AlumniService {
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
      const conditions = [eq(alumni.slug, fields.slug)];
      if (fields.excludeId) {
        conditions.push(ne(alumni.id, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(alumni)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slug');
      }
    }

    return duplicateFields;
  }

  async create(createAlumniDto: CreateAlumniDto) {
    const {
      academicProfile,
      careers,
      achievements,
      contacts,
      sectionMembers,
      meta,
      ...alumniData
    } = createAlumniDto;

    // Auto-dedupe the slug instead of rejecting the request
    if (alumniData.slug) {
      alumniData.slug = await generateUniqueSlug(
        alumniData.slug,
        async (slug) => (await this.checkDuplicates({ slug })).length > 0,
      );
    }

    let newAlumni: typeof alumni.$inferSelect;
    try {
      [newAlumni] = await db.insert(alumni).values(alumniData).returning();
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

    const id = newAlumni.id;

    // Create Academic Profile
    if (academicProfile) {
      await db.insert(alumniAcademicProfile).values({
        alumniId: id,
        ...academicProfile,
      });
    }

    // Create Careers
    if (careers && careers.length > 0) {
      await db.insert(alumniCareer).values(
        careers.map((c) => ({
          alumniId: id,
          ...c,
        })),
      );
    }

    // Create Achievements
    if (achievements && achievements.length > 0) {
      await db.insert(alumniAchievement).values(
        achievements.map((a) => ({
          alumniId: id,
          ...a,
        })),
      );
    }

    // Create Contacts
    if (contacts && contacts.length > 0) {
      await db.insert(alumniContact).values(
        contacts.map((c) => ({
          alumniId: id,
          ...c,
        })),
      );
    }

    // Create Section Members
    if (sectionMembers && sectionMembers.length > 0) {
      await db.insert(alumniSectionMember).values(
        sectionMembers.map((sm) => ({
          alumniId: id,
          ...sm,
        })),
      );
    }

    // Create Meta
    if (meta) {
      await db.insert(alumniMeta).values({
        alumniId: id,
        ...meta,
      });
    }

    return await this.findOne(id);
  }

  async findAll() {
    // Return alumni with section members for grouping
    return await db.query.alumni.findMany({
      orderBy: desc(alumni.createdAt),
      with: {
        sectionMembers: true,
        academicProfile: true,
        careers: true,
        achievements: true,
        contacts: true,
        meta: true,
      },
    });
  }

  async findOne(id: string) {
    const [result] = await db.select().from(alumni).where(eq(alumni.id, id));

    if (!result) {
      throw new NotFoundException(`Alumni with ID ${id} not found`);
    }

    // Fetch related data
    const academic = await db
      .select()
      .from(alumniAcademicProfile)
      .where(eq(alumniAcademicProfile.alumniId, id));
    const careers = await db
      .select()
      .from(alumniCareer)
      .where(eq(alumniCareer.alumniId, id));
    const achievements = await db
      .select()
      .from(alumniAchievement)
      .where(eq(alumniAchievement.alumniId, id));
    const contacts = await db
      .select()
      .from(alumniContact)
      .where(eq(alumniContact.alumniId, id));
    const sectionMembers = await db
      .select()
      .from(alumniSectionMember)
      .where(eq(alumniSectionMember.alumniId, id));
    const meta = await db
      .select()
      .from(alumniMeta)
      .where(eq(alumniMeta.alumniId, id));

    return {
      ...result,
      academicProfile: academic[0] || null,
      careers,
      achievements,
      contacts,
      sectionMembers,
      meta: meta[0] || null,
    };
  }

  async update(id: string, updateAlumniDto: UpdateAlumniDto) {
    const {
      academicProfile,
      careers,
      achievements,
      contacts,
      sectionMembers,
      meta,
      ...alumniData
    } = updateAlumniDto;

    // Check existence first
    const [existing] = await db.select().from(alumni).where(eq(alumni.id, id));
    if (!existing) {
      throw new NotFoundException(`Alumni with ID ${id} not found`);
    }

    // Check for duplicates before attempting update (excluding current record)
    if (alumniData.slug) {
      const duplicates = await this.checkDuplicates({
        slug: alumniData.slug,
        excludeId: id,
      });

      if (duplicates.length > 0) {
        const field = duplicates[0];
        throw new ConflictException({
          message: `Duplicate ${field} detected. This value already exists.`,
          field,
          constraint: `alumni_${field}_unique`,
          value: alumniData[field as keyof typeof alumniData],
        });
      }
    }

    try {
      await db
        .update(alumni)
        .set({ ...alumniData, updatedAt: new Date() })
        .where(eq(alumni.id, id))
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

    // Update Academic Profile
    if (academicProfile) {
      // Check if profile exists
      const existingProfile = await db
        .select()
        .from(alumniAcademicProfile)
        .where(eq(alumniAcademicProfile.alumniId, id))
        .limit(1);

      if (existingProfile.length > 0) {
        await db
          .update(alumniAcademicProfile)
          .set(academicProfile)
          .where(eq(alumniAcademicProfile.alumniId, id));
      } else {
        await db.insert(alumniAcademicProfile).values({
          alumniId: id,
          ...academicProfile,
        });
      }
    }

    // Update Careers (Replace strategy)
    if (careers) {
      await db.delete(alumniCareer).where(eq(alumniCareer.alumniId, id));
      if (careers.length > 0) {
        await db.insert(alumniCareer).values(
          careers.map((c) => ({
            alumniId: id,
            ...c,
          })),
        );
      }
    }

    // Update Achievements (Replace strategy)
    if (achievements) {
      await db
        .delete(alumniAchievement)
        .where(eq(alumniAchievement.alumniId, id));
      if (achievements.length > 0) {
        await db.insert(alumniAchievement).values(
          achievements.map((a) => ({
            alumniId: id,
            ...a,
          })),
        );
      }
    }

    // Update Contacts (Replace strategy)
    if (contacts) {
      await db.delete(alumniContact).where(eq(alumniContact.alumniId, id));
      if (contacts.length > 0) {
        await db.insert(alumniContact).values(
          contacts.map((c) => ({
            alumniId: id,
            ...c,
          })),
        );
      }
    }

    // Update Section Members (Replace strategy)
    if (sectionMembers) {
      await db
        .delete(alumniSectionMember)
        .where(eq(alumniSectionMember.alumniId, id));
      if (sectionMembers.length > 0) {
        await db.insert(alumniSectionMember).values(
          sectionMembers.map((sm) => ({
            alumniId: id,
            ...sm,
          })),
        );
      }
    }

    // Update Meta (Upsert)
    if (meta) {
      const existingMeta = await db
        .select()
        .from(alumniMeta)
        .where(eq(alumniMeta.alumniId, id))
        .limit(1);

      if (existingMeta.length > 0) {
        await db
          .update(alumniMeta)
          .set(meta)
          .where(eq(alumniMeta.alumniId, id));
      } else {
        await db.insert(alumniMeta).values({
          alumniId: id,
          ...meta,
        });
      }
    }

    const result = await this.findOne(id);
    await this.uploadCleanup.cleanupReplaced(existing, result);
    return result;
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(alumni)
      .where(eq(alumni.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Alumni with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupDeleted(deleted);
    return deleted;
  }
}
