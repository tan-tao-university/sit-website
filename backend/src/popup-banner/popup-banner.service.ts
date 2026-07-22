import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { db } from '../../db';
import { popupBanner } from '../../db/schema';
import { CreatePopupBannerDto } from './dto/create-popup-banner.dto';
import { UpdatePopupBannerDto } from './dto/update-popup-banner.dto';
import { UploadCleanupService } from '../upload/upload-cleanup.service';

@Injectable()
export class PopupBannerService {
  constructor(private readonly uploadCleanup: UploadCleanupService) {}

  async create(dto: CreatePopupBannerDto) {
    this.validateRange(dto.startsAt, dto.endsAt);

    if (dto.isActive) {
      await this.deactivateAll();
    }

    const [created] = await db
      .insert(popupBanner)
      .values({
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  findAll() {
    return db.select().from(popupBanner).orderBy(desc(popupBanner.updatedAt));
  }

  async findActive() {
    const now = new Date();
    const [activeBanner] = await db
      .select()
      .from(popupBanner)
      .where(
        and(
          eq(popupBanner.isActive, true),
          or(isNull(popupBanner.startsAt), lte(popupBanner.startsAt, now)),
          or(isNull(popupBanner.endsAt), gte(popupBanner.endsAt, now)),
        ),
      )
      .orderBy(desc(popupBanner.updatedAt))
      .limit(1);

    return activeBanner ?? null;
  }

  async findOne(id: string) {
    const [result] = await db
      .select()
      .from(popupBanner)
      .where(eq(popupBanner.id, id));

    if (!result) {
      throw new NotFoundException(`Popup banner with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, dto: UpdatePopupBannerDto) {
    const existing = await this.findOne(id);
    const startsAt =
      dto.startsAt === undefined ? existing.startsAt : dto.startsAt;
    const endsAt = dto.endsAt === undefined ? existing.endsAt : dto.endsAt;
    this.validateRange(startsAt, endsAt);

    if (dto.isActive) {
      await this.deactivateAll();
    }

    const { startsAt: nextStartsAt, endsAt: nextEndsAt, ...otherFields } = dto;
    const [updated] = await db
      .update(popupBanner)
      .set({
        ...otherFields,
        startsAt:
          nextStartsAt === undefined
            ? undefined
            : nextStartsAt
              ? new Date(nextStartsAt)
              : null,
        endsAt:
          nextEndsAt === undefined
            ? undefined
            : nextEndsAt
              ? new Date(nextEndsAt)
              : null,
        updatedAt: new Date(),
      })
      .where(eq(popupBanner.id, id))
      .returning();

    await this.uploadCleanup.cleanupReplaced(existing, updated);
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const [deleted] = await db
      .delete(popupBanner)
      .where(eq(popupBanner.id, id))
      .returning({ id: popupBanner.id });

    if (!deleted) {
      throw new NotFoundException(`Popup banner with ID ${id} not found`);
    }

    await this.uploadCleanup.cleanupDeleted(existing);
    return { message: 'Popup banner deleted successfully' };
  }

  private deactivateAll() {
    return db
      .update(popupBanner)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(popupBanner.isActive, true));
  }

  private validateRange(
    startsAt?: string | Date | null,
    endsAt?: string | Date | null,
  ) {
    if (startsAt && endsAt && new Date(endsAt) < new Date(startsAt)) {
      throw new BadRequestException('endsAt must be later than startsAt');
    }
  }
}
