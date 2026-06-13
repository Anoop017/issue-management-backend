import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, isNull, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import {
  issues,
  type IssuePriority,
  type IssueStatus,
} from '../../database/schema/issues.schema';
import { CreateIssueDto } from './dto/create-issue.dto';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
  ) { }

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

  async findAll(query: ListIssuesQueryDto) {
    const {
      status,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const conditions = [
      status ? eq(issues.status, status) : undefined,
      priority ? eq(issues.priority, priority) : undefined,
      search
        ? or(
          ilike(issues.title, `%${search}%`),
          ilike(issues.description, `%${search}%`),
        )
        : undefined,
      isNull(issues.deletedAt), // Exclude soft-deleted issues
    ].filter((condition) => condition !== undefined);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;
    const sortColumn = {
      createdAt: issues.createdAt,
      updatedAt: issues.updatedAt,
      title: issues.title,
      priority: issues.priority,
    }[sortBy];
    const orderByClause = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const baseIssuesQuery = this.database
      .select()
      .from(issues)
      .orderBy(orderByClause, asc(issues.id))
      .limit(limit)
      .offset(offset);

    const baseTotalQuery = this.database
      .select({ total: count() })
      .from(issues);

    const issuesQuery = whereClause
      ? baseIssuesQuery.where(whereClause)
      : baseIssuesQuery;
    const totalQuery = whereClause
      ? baseTotalQuery.where(whereClause)
      : baseTotalQuery;

    const [data, totalResult] = await Promise.all([issuesQuery, totalQuery]);
    const total = totalResult[0]?.total ?? 0;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, includeDeleted = false) {
    const [issue] = await this.database
      .select()
      .from(issues)
      .where(
        includeDeleted
          ? eq(issues.id, id)
          : and(eq(issues.id, id), isNull(issues.deletedAt)),
      );

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

  async softDelete(id: number) {
    await this.findOne(id);

    const [softDeletedIssue] = await this.database
      .update(issues)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();

    return {
      message: 'Issue moved to recycle bin',
      issue: softDeletedIssue,
    };
  }

  async permanentDelete(id: number) {
    await this.findOne(id, true); // Check if issue exists (including deleted)

    const [permanentlyDeletedIssue] = await this.database
      .delete(issues)
      .where(eq(issues.id, id))
      .returning({ id: issues.id });

    if (!permanentlyDeletedIssue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    return { message: 'Issue permanently deleted' };
  }

  async restore(id: number) {
    const [issue] = await this.database
      .select()
      .from(issues)
      .where(and(eq(issues.id, id), isNotNull(issues.deletedAt)));

    if (!issue) {
      throw new NotFoundException(
        `Deleted issue with ID ${id} not found in recycle bin`,
      );
    }

    const [restoredIssue] = await this.database
      .update(issues)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();

    return {
      message: 'Issue restored successfully',
      issue: restoredIssue,
    };
  }

  async findDeleted(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      this.database
        .select()
        .from(issues)
        .where(isNotNull(issues.deletedAt))
        .orderBy(desc(issues.deletedAt), asc(issues.id))
        .limit(limit)
        .offset(offset),
      this.database
        .select({ total: count() })
        .from(issues)
        .where(isNotNull(issues.deletedAt)),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async bulkSoftDelete(ids: number[]) {
    if (ids.length === 0) {
      return {
        message: 'No issues to delete',
        deletedCount: 0,
        issues: [],
      };
    }

    const deletedIssues = await this.database
      .update(issues)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(inArray(issues.id, ids))
      .returning();

    return {
      message: `${deletedIssues.length} issue(s) moved to recycle bin`,
      deletedCount: deletedIssues.length,
      issues: deletedIssues,
    };
  }

  async bulkPermanentDelete(ids: number[]) {
    if (ids.length === 0) {
      return {
        message: 'No issues to delete',
        deletedCount: 0,
      };
    }

    const result = await this.database
      .delete(issues)
      .where(inArray(issues.id, ids))
      .returning({ id: issues.id });

    return {
      message: `${result.length} issue(s) permanently deleted`,
      deletedCount: result.length,
      deletedIds: result.map((r) => r.id),
    };
  }

  async bulkRestore(ids: number[]) {
    if (ids.length === 0) {
      return {
        message: 'No issues to restore',
        restoredCount: 0,
        issues: [],
      };
    }

    const restoredIssues = await this.database
      .update(issues)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(and(inArray(issues.id, ids), isNotNull(issues.deletedAt)))
      .returning();

    return {
      message: `${restoredIssues.length} issue(s) restored successfully`,
      restoredCount: restoredIssues.length,
      issues: restoredIssues,
    };
  }
}
