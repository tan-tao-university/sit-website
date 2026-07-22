import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, desc, eq, gte, SQL } from 'drizzle-orm';
import { db } from '../../db';
import { event } from '../../db/schema';
import { CreateEventDto, EventStatus } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  async create(dto: CreateEventDto) {
    this.validateRange(dto.startAt, dto.endAt);

    const [created] = await db
      .insert(event)
      .values({
        ...dto,
        startAt: new Date(dto.startAt),
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  async findAll(filters?: {
    upcoming?: boolean;
    status?: string;
    limit?: number;
  }) {
    const conditions: SQL<unknown>[] = [];

    if (filters?.upcoming) {
      conditions.push(eq(event.status, EventStatus.PUBLISHED));
      conditions.push(gte(event.startAt, new Date()));
    } else if (filters?.status) {
      conditions.push(eq(event.status, filters.status));
    }

    let query = db
      .select()
      .from(event)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        ...(filters?.upcoming
          ? [desc(event.isFeatured), asc(event.startAt)]
          : [desc(event.startAt)]),
      )
      .$dynamic();

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return query;
  }

  async findOne(id: string) {
    const [result] = await db.select().from(event).where(eq(event.id, id));

    if (!result) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.findOne(id);
    const startAt = dto.startAt ?? existing.startAt.toISOString();
    const endAt = dto.endAt ?? existing.endAt?.toISOString();
    this.validateRange(startAt, endAt);

    const [updated] = await db
      .update(event)
      .set({
        ...dto,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(event.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(event)
      .where(eq(event.id, id))
      .returning({ id: event.id });

    if (!deleted) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return { message: 'Event deleted successfully' };
  }

  private validateRange(startAt: string, endAt?: string) {
    if (endAt && new Date(endAt) < new Date(startAt)) {
      throw new BadRequestException('endAt must be later than startAt');
    }
  }
}
