import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { achievement } from '../../db/schema';
import { eq, desc, and, SQL } from 'drizzle-orm';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class AchievementService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  async create(createAchievementDto: CreateAchievementDto) {
    const [newAchievement] = await db
      .insert(achievement)
      .values({
        ...createAchievementDto,
        updatedAt: new Date(),
      })
      .returning();

    return newAchievement;
  }

  async findAll(filters?: {
    type?: string;
    level?: string;
    visibility?: string;
    isHighlight?: boolean;
  }) {
    const conditions: SQL<unknown>[] = [];

    if (filters?.type) {
      conditions.push(eq(achievement.type, filters.type));
    }

    if (filters?.level) {
      conditions.push(eq(achievement.level, filters.level));
    }

    if (filters?.visibility) {
      conditions.push(eq(achievement.visibility, filters.visibility));
    }

    if (filters?.isHighlight !== undefined) {
      conditions.push(eq(achievement.isHighlight, filters.isHighlight));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(achievement)
        .where(and(...conditions))
        .orderBy(desc(achievement.achievedYear), desc(achievement.createdAt));
    }

    return await db
      .select()
      .from(achievement)
      .orderBy(desc(achievement.achievedYear), desc(achievement.createdAt));
  }

  async findOne(id: string) {
    const [result] = await db
      .select()
      .from(achievement)
      .where(eq(achievement.id, id));

    if (!result) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, updateAchievementDto: UpdateAchievementDto) {
    const existing = await this.findOne(id);
    const [updated] = await db
      .update(achievement)
      .set({
        ...updateAchievementDto,
        updatedAt: new Date(),
      })
      .where(eq(achievement.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupReplaced(existing, updated);
    return updated;
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(achievement)
      .where(eq(achievement.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupDeleted(deleted);
    return { message: 'Achievement deleted successfully' };
  }
}
