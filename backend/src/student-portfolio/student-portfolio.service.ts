import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import {
  studentPortfolio,
  studentPortfolioSkill,
  studentPortfolioProject,
  studentPortfolioExperience,
  studentPortfolioEducation,
  studentPortfolioAchievement,
  studentPortfolioContact,
} from '../../db/schema';
import { eq, desc, and, ne, asc } from 'drizzle-orm';
import { CreateStudentPortfolioDto } from './dto/create-student-portfolio.dto';
import { UpdateStudentPortfolioDto } from './dto/update-student-portfolio.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Injectable()
export class StudentPortfolioService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  private async checkDuplicates(fields: {
    slug?: string;
    excludeId?: string;
  }): Promise<string[]> {
    const duplicateFields: string[] = [];

    if (fields.slug) {
      const conditions = [eq(studentPortfolio.slug, fields.slug)];
      if (fields.excludeId) {
        conditions.push(ne(studentPortfolio.id, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(studentPortfolio)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slug');
      }
    }

    return duplicateFields;
  }

  async create(dto: CreateStudentPortfolioDto) {
    const {
      skills,
      projects,
      experiences,
      education,
      achievements,
      contacts,
      ...portfolioData
    } = dto;

    // Auto-dedupe the slug instead of rejecting the request
    portfolioData.slug = await generateUniqueSlug(
      portfolioData.slug,
      async (slug) => (await this.checkDuplicates({ slug })).length > 0,
    );

    let created: typeof studentPortfolio.$inferSelect;
    try {
      [created] = await db
        .insert(studentPortfolio)
        .values(portfolioData)
        .returning();
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        const parsed = parseDuplicateKeyError(error);
        throw new ConflictException({
          message: 'Duplicate slug detected. This value already exists.',
          field: parsed?.field ?? 'slug',
          value: parsed?.value,
        });
      }
      throw error;
    }

    const portfolioId = created.id;

    if (skills?.length) {
      await db
        .insert(studentPortfolioSkill)
        .values(skills.map((s) => ({ ...s, portfolioId })));
    }
    if (projects?.length) {
      await db
        .insert(studentPortfolioProject)
        .values(projects.map((p) => ({ ...p, portfolioId })));
    }
    if (experiences?.length) {
      await db
        .insert(studentPortfolioExperience)
        .values(experiences.map((e) => ({ ...e, portfolioId })));
    }
    if (education?.length) {
      await db
        .insert(studentPortfolioEducation)
        .values(education.map((e) => ({ ...e, portfolioId })));
    }
    if (achievements?.length) {
      await db
        .insert(studentPortfolioAchievement)
        .values(achievements.map((a) => ({ ...a, portfolioId })));
    }
    if (contacts?.length) {
      await db
        .insert(studentPortfolioContact)
        .values(contacts.map((c) => ({ ...c, portfolioId })));
    }

    return this.findOne(portfolioId);
  }

  /** Admin listing — every portfolio regardless of publish state. */
  async findAllForAdmin() {
    return db
      .select()
      .from(studentPortfolio)
      .orderBy(desc(studentPortfolio.createdAt));
  }

  /** Public listing — published portfolios only. */
  async findAll() {
    return db
      .select()
      .from(studentPortfolio)
      .where(eq(studentPortfolio.isPublished, true))
      .orderBy(desc(studentPortfolio.createdAt));
  }

  private async attachRelations(result: typeof studentPortfolio.$inferSelect) {
    const id = result.id;
    const [skills, projects, experiences, education, achievements, contacts] =
      await Promise.all([
        db
          .select()
          .from(studentPortfolioSkill)
          .where(eq(studentPortfolioSkill.portfolioId, id))
          .orderBy(asc(studentPortfolioSkill.displayOrder)),
        db
          .select()
          .from(studentPortfolioProject)
          .where(eq(studentPortfolioProject.portfolioId, id))
          .orderBy(asc(studentPortfolioProject.displayOrder)),
        db
          .select()
          .from(studentPortfolioExperience)
          .where(eq(studentPortfolioExperience.portfolioId, id))
          .orderBy(asc(studentPortfolioExperience.displayOrder)),
        db
          .select()
          .from(studentPortfolioEducation)
          .where(eq(studentPortfolioEducation.portfolioId, id))
          .orderBy(asc(studentPortfolioEducation.displayOrder)),
        db
          .select()
          .from(studentPortfolioAchievement)
          .where(eq(studentPortfolioAchievement.portfolioId, id))
          .orderBy(asc(studentPortfolioAchievement.displayOrder)),
        db
          .select()
          .from(studentPortfolioContact)
          .where(eq(studentPortfolioContact.portfolioId, id))
          .orderBy(asc(studentPortfolioContact.displayOrder)),
      ]);

    return {
      ...result,
      skills,
      projects,
      experiences,
      education,
      achievements,
      contacts,
    };
  }

  /** Admin lookup by ID — ignores publish state. */
  async findOne(id: string) {
    const [result] = await db
      .select()
      .from(studentPortfolio)
      .where(eq(studentPortfolio.id, id));

    if (!result) {
      throw new NotFoundException(`Student portfolio with ID ${id} not found`);
    }

    return this.attachRelations(result);
  }

  /** Public lookup by slug — only returns published portfolios. */
  async findPublishedBySlug(slugOrId: string) {
    const match = UUID_RE.test(slugOrId)
      ? eq(studentPortfolio.id, slugOrId)
      : eq(studentPortfolio.slug, slugOrId);

    const [result] = await db
      .select()
      .from(studentPortfolio)
      .where(and(match, eq(studentPortfolio.isPublished, true)));

    if (!result) {
      throw new NotFoundException('Student portfolio not found');
    }

    return this.attachRelations(result);
  }

  async update(id: string, dto: UpdateStudentPortfolioDto) {
    const [existing] = await db
      .select()
      .from(studentPortfolio)
      .where(eq(studentPortfolio.id, id));
    if (!existing) {
      throw new NotFoundException(`Student portfolio with ID ${id} not found`);
    }

    if (dto.slug) {
      const duplicates = await this.checkDuplicates({
        slug: dto.slug,
        excludeId: id,
      });
      if (duplicates.length > 0) {
        throw new ConflictException({
          message: 'Duplicate slug detected. This value already exists.',
          field: 'slug',
          value: dto.slug,
        });
      }
    }

    const {
      skills,
      projects,
      experiences,
      education,
      achievements,
      contacts,
      ...portfolioData
    } = dto;

    if (Object.keys(portfolioData).length > 0) {
      await db
        .update(studentPortfolio)
        .set({ ...portfolioData, updatedAt: new Date() })
        .where(eq(studentPortfolio.id, id));
    }

    // Related collections are replaced wholesale when provided — simplest
    // model for a form that submits the full list each time.
    if (skills !== undefined) {
      await db
        .delete(studentPortfolioSkill)
        .where(eq(studentPortfolioSkill.portfolioId, id));
      if (skills.length) {
        await db
          .insert(studentPortfolioSkill)
          .values(skills.map((s) => ({ ...s, portfolioId: id })));
      }
    }
    if (projects !== undefined) {
      await db
        .delete(studentPortfolioProject)
        .where(eq(studentPortfolioProject.portfolioId, id));
      if (projects.length) {
        await db
          .insert(studentPortfolioProject)
          .values(projects.map((p) => ({ ...p, portfolioId: id })));
      }
    }
    if (experiences !== undefined) {
      await db
        .delete(studentPortfolioExperience)
        .where(eq(studentPortfolioExperience.portfolioId, id));
      if (experiences.length) {
        await db
          .insert(studentPortfolioExperience)
          .values(experiences.map((e) => ({ ...e, portfolioId: id })));
      }
    }
    if (education !== undefined) {
      await db
        .delete(studentPortfolioEducation)
        .where(eq(studentPortfolioEducation.portfolioId, id));
      if (education.length) {
        await db
          .insert(studentPortfolioEducation)
          .values(education.map((e) => ({ ...e, portfolioId: id })));
      }
    }
    if (achievements !== undefined) {
      await db
        .delete(studentPortfolioAchievement)
        .where(eq(studentPortfolioAchievement.portfolioId, id));
      if (achievements.length) {
        await db
          .insert(studentPortfolioAchievement)
          .values(achievements.map((a) => ({ ...a, portfolioId: id })));
      }
    }
    if (contacts !== undefined) {
      await db
        .delete(studentPortfolioContact)
        .where(eq(studentPortfolioContact.portfolioId, id));
      if (contacts.length) {
        await db
          .insert(studentPortfolioContact)
          .values(contacts.map((c) => ({ ...c, portfolioId: id })));
      }
    }

    const result = await this.findOne(id);
    await this.uploadCleanup.cleanupReplaced(existing, result);
    return result;
  }

  async remove(id: string) {
    const [existing] = await db
      .select()
      .from(studentPortfolio)
      .where(eq(studentPortfolio.id, id));
    if (!existing) {
      throw new NotFoundException(`Student portfolio with ID ${id} not found`);
    }

    const deleted = await this.findOne(id);
    await db.delete(studentPortfolio).where(eq(studentPortfolio.id, id));
    await this.uploadCleanup.cleanupDeleted(deleted);
    return deleted;
  }
}
