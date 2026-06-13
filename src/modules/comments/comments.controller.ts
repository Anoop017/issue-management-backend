import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { PaginatedCommentsDto } from './dto/paginated-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsService } from './comments.service';

@ApiTags('Comments')
@Controller('issues/:issueId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Add comment to an issue',
    description: 'Creates a new comment for the provided issue ID.',
  })
  @ApiParam({ name: 'issueId', type: Number, example: 1 })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully.',
    type: CommentDto,
    example: {
      id: 1,
      issueId: 1,
      content: 'I reproduced this on the staging environment as well.',
      authorName: 'Anoop',
      createdAt: '2026-06-13T10:15:00.000Z',
      updatedAt: '2026-06-13T10:15:00.000Z',
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  create(
    @Param('issueId', ParseIntPipe) issueId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(issueId, createCommentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List comments for an issue',
    description: 'Returns all comments attached to the provided issue ID.',
  })
  @ApiParam({ name: 'issueId', type: Number, example: 1 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt'],
    description: 'Sort comments by a supported field',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully.',
    type: PaginatedCommentsDto,
    example: {
      data: [
        {
          id: 1,
          issueId: 1,
          content: 'I reproduced this on the staging environment as well.',
          authorName: 'Anoop',
          createdAt: '2026-06-13T10:15:00.000Z',
          updatedAt: '2026-06-13T10:15:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  findAll(
    @Param('issueId', ParseIntPipe) issueId: number,
    @Query() query: ListCommentsQueryDto,
  ) {
    return this.commentsService.findAll(issueId, query);
  }

  @Patch(':commentId')
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Updates one or more comment fields for the provided issue.',
  })
  @ApiParam({ name: 'issueId', type: Number, example: 1 })
  @ApiParam({ name: 'commentId', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully.',
    type: CommentDto,
    example: {
      id: 1,
      issueId: 1,
      content: 'Confirmed on staging and production.',
      authorName: 'Anoop',
      createdAt: '2026-06-13T10:15:00.000Z',
      updatedAt: '2026-06-13T10:20:00.000Z',
    },
  })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  update(
    @Param('issueId', ParseIntPipe) issueId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(issueId, commentId, updateCommentDto);
  }

  @Delete(':commentId')
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Deletes a comment from the provided issue.',
  })
  @ApiParam({ name: 'issueId', type: Number, example: 1 })
  @ApiParam({ name: 'commentId', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully.',
    schema: {
      example: {
        message: 'Comment deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  remove(
    @Param('issueId', ParseIntPipe) issueId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.remove(issueId, commentId);
  }
}
