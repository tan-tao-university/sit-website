import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../../db';
import { handbook } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateHandbookDto, UpdateHandbookDto } from './dto/handbook.dto';
import {
  isPgUniqueViolation,
  parseDuplicateKeyError,
} from '../common/utils/error-parser.util';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class HandbookService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  async create(data: CreateHandbookDto) {
    try {
      const [row] = await db.insert(handbook).values(data).returning();
      return row;
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        const parsed = parseDuplicateKeyError(error);
        throw new ConflictException({
          message: 'Năm học này đã tồn tại.',
          field: parsed.field,
          constraint: parsed.constraint,
          value: parsed.value,
        });
      }
      throw error;
    }
  }

  /** All editions, newest school year first. `publishedOnly` for public listings. */
  async findAll(publishedOnly = false) {
    const rows = await db
      .select()
      .from(handbook)
      .orderBy(desc(handbook.schoolYear));
    return publishedOnly ? rows.filter((r) => r.status === 'published') : rows;
  }

  /** The edition shown on the public site: latest published school year. */
  async findCurrent() {
    const published = await this.findAll(true);
    if (published.length === 0) {
      throw new NotFoundException('No published handbook');
    }
    return published[0];
  }

  async findByYear(schoolYear: string) {
    const [row] = await db
      .select()
      .from(handbook)
      .where(eq(handbook.schoolYear, schoolYear));
    if (!row) throw new NotFoundException('Handbook not found');
    return row;
  }

  async findOne(id: string) {
    const [row] = await db.select().from(handbook).where(eq(handbook.id, id));
    if (!row) throw new NotFoundException('Handbook not found');
    return row;
  }

  async update(id: string, data: UpdateHandbookDto) {
    const [existing] = await db
      .select()
      .from(handbook)
      .where(eq(handbook.id, id));
    if (!existing) throw new NotFoundException('Handbook not found');

    try {
      const [row] = await db
        .update(handbook)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(handbook.id, id))
        .returning();
      await this.uploadCleanup.cleanupReplaced(existing, row);
      return row;
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        const parsed = parseDuplicateKeyError(error);
        throw new ConflictException({
          message: 'Năm học này đã tồn tại.',
          field: parsed.field,
          constraint: parsed.constraint,
          value: parsed.value,
        });
      }
      throw error;
    }
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(handbook)
      .where(eq(handbook.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Handbook not found');
    await this.uploadCleanup.cleanupDeleted(deleted);
    return deleted;
  }
}
