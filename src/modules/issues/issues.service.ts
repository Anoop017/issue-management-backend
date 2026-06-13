import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import {
  issues,
  type IssuePriority,
  type IssueStatus,
} from '../../database/schema/issues.schema';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
  ) {}

  async create(createIssueDto: CreateIssueDto) {
    const [issue] = await this.database
      .insert(issues)
      .values({
        title: createIssueDto.title,
        description: createIssueDto.description,
        priority: createIssueDto.priority ?? 'medium',
      })
      .returning();

    return issue;
  }

  async findAll(filters?: { status?: IssueStatus; priority?: IssuePriority }) {
    const conditions = [
      filters?.status ? eq(issues.status, filters.status) : undefined,
      filters?.priority ? eq(issues.priority, filters.priority) : undefined,
    ].filter((condition) => condition !== undefined);

    if (conditions.length === 0) {
      return this.database.select().from(issues).orderBy(asc(issues.id));
    }

    return this.database
      .select()
      .from(issues)
      .where(and(...conditions))
      .orderBy(asc(issues.id));
  }

  async findOne(id: number) {
    const [issue] = await this.database
      .select()
      .from(issues)
      .where(eq(issues.id, id));

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    return issue;
  }

  async update(id: number, updateIssueDto: UpdateIssueDto) {
    await this.findOne(id);

    const updatePayload = Object.fromEntries(
      Object.entries(updateIssueDto).filter(([, value]) => value !== undefined),
    );

    const [updatedIssue] = await this.database
      .update(issues)
      .set({
        ...updatePayload,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();

    return updatedIssue;
  }

  async remove(id: number) {
    const [deletedIssue] = await this.database
      .delete(issues)
      .where(eq(issues.id, id))
      .returning({ id: issues.id });

    if (!deletedIssue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    return { message: 'Issue deleted successfully' };
  }
}
