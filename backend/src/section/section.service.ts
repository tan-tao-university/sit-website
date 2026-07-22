import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { curriculumSection } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  async create(createSectionDto: CreateSectionDto) {
    const [newSection] = await db
      .insert(curriculumSection)
      .values(createSectionDto)
      .returning();
    return newSection;
  }

  async findAll(curriculumId?: string) {
    if (curriculumId) {
      return await db
        .select()
        .from(curriculumSection)
        .where(eq(curriculumSection.curriculumId, curriculumId))
        .orderBy(asc(curriculumSection.displayOrder));
    }
    return await db
      .select()
      .from(curriculumSection)
      .orderBy(asc(curriculumSection.displayOrder));
  }

  async findOne(id: string) {
    const [result] = await db
      .select()
      .from(curriculumSection)
      .where(eq(curriculumSection.sectionId, id));

    if (!result) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const [updated] = await db
      .update(curriculumSection)
      .set(updateSectionDto)
      .where(eq(curriculumSection.sectionId, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return updated;
  }

  async updateOrder(id: string, displayOrder: number) {
    const [updated] = await db
      .update(curriculumSection)
      .set({ displayOrder })
      .where(eq(curriculumSection.sectionId, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(curriculumSection)
      .where(eq(curriculumSection.sectionId, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return deleted;
  }
}
