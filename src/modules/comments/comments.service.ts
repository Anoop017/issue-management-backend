import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { comments } from '../../database/schema/comments.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
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

  async findAll(issueId: number) {
    await this.issuesService.findOne(issueId);

    return this.database
      .select()
      .from(comments)
      .where(eq(comments.issueId, issueId))
      .orderBy(asc(comments.id));
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
