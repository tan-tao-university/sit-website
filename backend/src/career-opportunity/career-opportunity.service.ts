import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, gte, isNull, or, SQL } from 'drizzle-orm';
import { db } from '../../db';
import { careerOpportunity } from '../../db/schema';
import {
  CareerOpportunityStatus,
  CareerOpportunityType,
  CareerWorkMode,
  CreateCareerOpportunityDto,
} from './dto/create-career-opportunity.dto';
import { UpdateCareerOpportunityDto } from './dto/update-career-opportunity.dto';

@Injectable()
export class CareerOpportunityService {
  async create(dto: CreateCareerOpportunityDto) {
    const status = dto.status ?? CareerOpportunityStatus.DRAFT;
    const [created] = await db
      .insert(careerOpportunity)
      .values({
        ...dto,
        status,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : null,
        publishedAt: dto.publishedAt
          ? new Date(dto.publishedAt)
          : status === CareerOpportunityStatus.PUBLISHED
            ? new Date()
            : null,
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  async findPublished(filters?: {
    type?: CareerOpportunityType;
    workMode?: CareerWorkMode;
    limit?: number;
  }) {
    const conditions: SQL<unknown>[] = [
      eq(careerOpportunity.status, CareerOpportunityStatus.PUBLISHED),
      or(
        isNull(careerOpportunity.applicationDeadline),
        gte(careerOpportunity.applicationDeadline, new Date()),
      )!,
    ];

    if (filters?.type) {
      conditions.push(eq(careerOpportunity.type, filters.type));
    }
    if (filters?.workMode) {
      conditions.push(eq(careerOpportunity.workMode, filters.workMode));
    }

    let query = db
      .select()
      .from(careerOpportunity)
      .where(and(...conditions))
      .orderBy(
        desc(careerOpportunity.isFeatured),
        desc(careerOpportunity.publishedAt),
        asc(careerOpportunity.applicationDeadline),
      )
      .$dynamic();

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return query;
  }

  async findAllAdmin(filters?: {
    status?: CareerOpportunityStatus;
    type?: CareerOpportunityType;
  }) {
    const conditions: SQL<unknown>[] = [];
    if (filters?.status) {
      conditions.push(eq(careerOpportunity.status, filters.status));
    }
    if (filters?.type) {
      conditions.push(eq(careerOpportunity.type, filters.type));
    }

    return db
      .select()
      .from(careerOpportunity)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        desc(careerOpportunity.isFeatured),
        desc(careerOpportunity.createdAt),
      );
  }

  async findOneAdmin(id: string) {
    const [result] = await db
      .select()
      .from(careerOpportunity)
      .where(eq(careerOpportunity.id, id));

    if (!result) {
      throw new NotFoundException(`Career opportunity with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, dto: UpdateCareerOpportunityDto) {
    const existing = await this.findOneAdmin(id);
    // `status` is stored as varchar, but is only ever written from this enum.
    const nextStatus = (dto.status ??
      existing.status) as CareerOpportunityStatus;

    const [updated] = await db
      .update(careerOpportunity)
      .set({
        ...dto,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : undefined,
        publishedAt: dto.publishedAt
          ? new Date(dto.publishedAt)
          : nextStatus === CareerOpportunityStatus.PUBLISHED &&
              !existing.publishedAt
            ? new Date()
            : undefined,
        updatedAt: new Date(),
      })
      .where(eq(careerOpportunity.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(careerOpportunity)
      .where(eq(careerOpportunity.id, id))
      .returning({ id: careerOpportunity.id });

    if (!deleted) {
      throw new NotFoundException(`Career opportunity with ID ${id} not found`);
    }

    return { message: 'Career opportunity deleted successfully' };
  }
}
