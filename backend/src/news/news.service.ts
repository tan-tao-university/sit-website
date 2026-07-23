import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import { news } from '../../db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

type YooptaBlock = {
  type: string;
  value?: { text?: string }[];
  children?: YooptaBlock[]; // Handle potential nested structures if any
};

type YooptaContent = {
  blocks?: Record<string, YooptaBlock> | YooptaBlock[];
};

@Injectable()
export class NewsService {
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
      const conditions = [eq(news.slug, fields.slug)];
      if (fields.excludeId) {
        conditions.push(ne(news.id, fields.excludeId));
      }
      const existing = await db
        .select()
        .from(news)
        .where(and(...conditions))
        .limit(1);
      if (existing.length > 0) {
        duplicateFields.push('slug');
      }
    }

    return duplicateFields;
  }

  yooptaToPlainText(content: YooptaContent | null | undefined): string {
    if (!content?.blocks) return '';

    // Handle both array and object formats for blocks if necessary, though strictly it's usually an object in Yoopta
    const blocks = Array.isArray(content.blocks)
      ? content.blocks
      : Object.values<YooptaBlock>(content.blocks);

    const texts: string[] = [];

    for (const block of blocks) {
      this.extractTextFromBlock(block, texts);
    }

    return texts.join('\n');
  }

  private extractTextFromBlock(block: YooptaBlock, texts: string[]) {
    if (block.type === 'heading' && block.value) {
      const blockText = block.value
        .map((v) => v.text)
        .filter(Boolean)
        .join('');
      if (blockText.trim()) {
        texts.push('\n' + blockText.toUpperCase() + '\n');
      }
    } else if (block.type === 'list' && block.value) {
      const blockText = block.value
        .map((v) => v.text)
        .filter(Boolean)
        .join('');
      if (blockText.trim()) {
        texts.push('- ' + blockText);
      }
    } else if (block.type === 'blockquote' && block.value) {
      const blockText = block.value
        .map((v) => v.text)
        .filter(Boolean)
        .join('');
      if (blockText.trim()) {
        texts.push(`"${blockText}"`);
      }
    } else if (block.value) {
      // paragraph and others
      const blockText = block.value
        .map((v) => v.text)
        .filter(Boolean)
        .join('');

      if (blockText.trim()) {
        texts.push(blockText);
      }
    }

    // Simple recursion if needed, though Yoopta structure is usually flat at top level blocks map
    if (block.children) {
      for (const child of block.children) {
        this.extractTextFromBlock(child, texts);
      }
    }
  }

  async create(data: CreateNewsDto) {
    // Slug is auto-generated and hidden from the user, so auto-dedupe it
    if (data.slug) {
      data.slug = await generateUniqueSlug(
        data.slug,
        async (slug) => (await this.checkDuplicates({ slug })).length > 0,
      );
    }

    const contentText = this.yooptaToPlainText(data.content);
    const { publishedAt, ...newsData } = data;

    try {
      const [newNews] = await db
        .insert(news)
        .values({
          ...newsData,
          contentText,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        })
        .returning();

      return newNews;
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
    return db
      .select()
      .from(news)
      .orderBy(desc(news.publishedAt), desc(news.createdAt));
  }

  async findOne(idOrSlug: string) {
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        idOrSlug,
      );

    const match = isUuid ? eq(news.id, idOrSlug) : eq(news.slug, idOrSlug);
    const [item] = await db.select().from(news).where(match);

    if (!item) throw new NotFoundException('News not found');
    return item;
  }

  async update(id: string, data: UpdateNewsDto) {
    // Check existence first
    const [existing] = await db.select().from(news).where(eq(news.id, id));
    if (!existing) {
      throw new NotFoundException('News not found');
    }

    // Check for duplicates before attempting update (excluding current record)
    if (data.slug) {
      const duplicates = await this.checkDuplicates({
        slug: data.slug,
        excludeId: id,
      });

      if (duplicates.length > 0) {
        throw new ConflictException({
          message: 'Duplicate slug detected. This value already exists.',
          field: 'slug',
          constraint: 'news_slug_unique',
          value: data.slug,
        });
      }
    }

    const contentText = data.content
      ? this.yooptaToPlainText(data.content)
      : undefined;

    const { publishedAt, ...newsData } = data;
    const updateData: Partial<typeof news.$inferInsert> = {
      ...newsData,
      publishedAt: publishedAt
        ? new Date(publishedAt)
        : (existing.publishedAt ?? new Date()),
    };
    if (contentText) updateData.contentText = contentText;

    try {
      const [updatedNews] = await db
        .update(news)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(news.id, id))
        .returning();

      await this.uploadCleanup.cleanupReplaced(existing, updatedNews);
      return updatedNews;
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
    const [deleted] = await db.delete(news).where(eq(news.id, id)).returning();
    if (!deleted) throw new NotFoundException('News not found');
    await this.uploadCleanup.cleanupDeleted(deleted);
    return deleted;
  }
}
