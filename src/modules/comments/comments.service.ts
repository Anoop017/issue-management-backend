import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { comments } from '../../database/schema/comments.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IssuesService } from '../issues/issues.service';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly issuesService: IssuesService,
  ) {}

  async create(issueId: number, createCommentDto: CreateCommentDto) {
    await this.issuesService.findOne(issueId);

    const [comment] = await this.database
      .insert(comments)
      .values({
        issueId,
        content: createCommentDto.content,
        authorName: createCommentDto.authorName,
      })
      .returning();

    return comment;
  }

  async findAll(issueId: number, query: ListCommentsQueryDto) {
    await this.issuesService.findOne(issueId);

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const offset = (page - 1) * limit;
    const sortColumn = {
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    }[sortBy];
    const orderByClause = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const dataQuery = this.database
      .select()
      .from(comments)
      .where(eq(comments.issueId, issueId))
      .orderBy(orderByClause, asc(comments.id))
      .limit(limit)
      .offset(offset);

    const totalQuery = this.database
      .select({ total: count() })
      .from(comments)
      .where(eq(comments.issueId, issueId));

    const [data, totalResult] = await Promise.all([dataQuery, totalQuery]);
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

  async update(
    issueId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const updatePayload = Object.fromEntries(
      Object.entries(updateCommentDto).filter(([, value]) => value !== undefined),
    );

    const [updatedComment] = await this.database
      .update(comments)
      .set({
        ...updatePayload,
        updatedAt: new Date(),
      })
      .where(and(eq(comments.id, commentId), eq(comments.issueId, issueId)))
      .returning();

    if (!updatedComment) {
      throw new NotFoundException(
        `Comment with ID ${commentId} not found for issue ${issueId}`,
      );
    }

    return updatedComment;
  }

  async remove(issueId: number, commentId: number) {
    const [deletedComment] = await this.database
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.issueId, issueId)))
      .returning({ id: comments.id });

    if (!deletedComment) {
      throw new NotFoundException(
        `Comment with ID ${commentId} not found for issue ${issueId}`,
      );
    }

    return { message: 'Comment deleted successfully' };
  }
}
