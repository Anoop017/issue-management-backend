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
import {
  issuePriorities,
  issueStatuses,
} from '../../database/schema/issues.schema';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { IssueDto } from './dto/issue.dto';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { PaginatedIssuesDto } from './dto/paginated-issues.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssuesService } from './issues.service';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new issue',
    description: 'Creates an issue with title, description, and optional priority.',
  })
  @ApiResponse({
    status: 201,
    description: 'Issue created successfully.',
    type: IssueDto,
    example: {
      id: 1,
      title: 'Login page throws 500 error',
      description: 'Users see a 500 error after submitting valid credentials.',
      status: 'open',
      priority: 'high',
      createdAt: '2026-06-13T09:30:00.000Z',
      updatedAt: '2026-06-13T09:30:00.000Z',
    },
  })
  create(@Body() createIssueDto: CreateIssueDto) {
    return this.issuesService.create(createIssueDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all issues',
    description: 'Returns all issues with optional filtering by status and priority.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: issueStatuses,
    description: 'Filter issues by status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: issuePriorities,
    description: 'Filter issues by priority',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search issues by title or description',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'title', 'priority'],
    description: 'Sort issues by a supported field',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @ApiResponse({
    status: 200,
    description: 'Issues retrieved successfully.',
    type: PaginatedIssuesDto,
    example: {
      data: [
        {
          id: 1,
          title: 'Login page throws 500 error',
          description: 'Users see a 500 error after submitting valid credentials.',
          status: 'open',
          priority: 'high',
          createdAt: '2026-06-13T09:30:00.000Z',
          updatedAt: '2026-06-13T09:30:00.000Z',
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
  findAll(@Query() query: ListIssuesQueryDto) {
    return this.issuesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an issue by ID',
    description: 'Returns a single issue by its unique identifier.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Issue retrieved successfully.',
    type: IssueDto,
    example: {
      id: 1,
      title: 'Login page throws 500 error',
      description: 'Users see a 500 error after submitting valid credentials.',
      status: 'open',
      priority: 'high',
      createdAt: '2026-06-13T09:30:00.000Z',
      updatedAt: '2026-06-13T09:30:00.000Z',
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an issue',
    description: 'Updates one or more issue fields by ID.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Issue updated successfully.',
    type: IssueDto,
    example: {
      id: 1,
      title: 'Login page throws 500 error',
      description: 'Users see a 500 error after submitting valid credentials.',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2026-06-13T09:30:00.000Z',
      updatedAt: '2026-06-13T10:00:00.000Z',
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIssueDto: UpdateIssueDto,
  ) {
    return this.issuesService.update(id, updateIssueDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete an issue',
    description: 'Moves an issue to the recycle bin (soft delete). Use DELETE /issues/:id/permanent to permanently delete.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Issue moved to recycle bin.',
    schema: {
      example: {
        message: 'Issue moved to recycle bin',
        issue: {
          id: 1,
          title: 'Login page throws 500 error',
          description: 'Users see a 500 error after submitting valid credentials.',
          status: 'open',
          priority: 'high',
          createdAt: '2026-06-13T09:30:00.000Z',
          updatedAt: '2026-06-13T10:15:00.000Z',
          deletedAt: '2026-06-13T10:15:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.issuesService.softDelete(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({
    summary: 'Permanently delete an issue',
    description: 'Permanently deletes an issue from the database. This action cannot be undone.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Issue permanently deleted.',
    schema: {
      example: {
        message: 'Issue permanently deleted',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  permanentDelete(@Param('id', ParseIntPipe) id: number) {
    return this.issuesService.permanentDelete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restore a deleted issue',
    description: 'Restores a soft-deleted issue from the recycle bin.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Issue restored successfully.',
    schema: {
      example: {
        message: 'Issue restored successfully',
        issue: {
          id: 1,
          title: 'Login page throws 500 error',
          description: 'Users see a 500 error after submitting valid credentials.',
          status: 'open',
          priority: 'high',
          createdAt: '2026-06-13T09:30:00.000Z',
          updatedAt: '2026-06-13T10:20:00.000Z',
          deletedAt: null,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Deleted issue not found.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.issuesService.restore(id);
  }

  @Get('deleted/bin')
  @ApiOperation({
    summary: 'List deleted issues (recycle bin)',
    description: 'Returns all soft-deleted issues for recovery or permanent deletion.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted issues retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: 'Login page throws 500 error',
            description: 'Users see a 500 error after submitting valid credentials.',
            status: 'open',
            priority: 'high',
            createdAt: '2026-06-13T09:30:00.000Z',
            updatedAt: '2026-06-13T10:15:00.000Z',
            deletedAt: '2026-06-13T10:15:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  findDeleted(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.issuesService.findDeleted(page, limit);
  }

  @Post('bulk/soft-delete')
  @ApiOperation({
    summary: 'Soft delete multiple issues',
    description: 'Moves multiple issues to the recycle bin in a single operation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Issues moved to recycle bin.',
    schema: {
      example: {
        message: '3 issue(s) moved to recycle bin',
        deletedCount: 3,
        issues: [
          {
            id: 1,
            title: 'Login page throws 500 error',
            description: 'Users see a 500 error after submitting valid credentials.',
            status: 'open',
            priority: 'high',
            createdAt: '2026-06-13T09:30:00.000Z',
            updatedAt: '2026-06-13T10:15:00.000Z',
            deletedAt: '2026-06-13T10:15:00.000Z',
          },
        ],
      },
    },
  })
  bulkSoftDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.issuesService.bulkSoftDelete(bulkDeleteDto.ids);
  }

  @Delete('bulk/permanent')
  @ApiOperation({
    summary: 'Permanently delete multiple issues',
    description: 'Permanently deletes multiple issues from the database. This action cannot be undone.',
  })
  @ApiResponse({
    status: 200,
    description: 'Issues permanently deleted.',
    schema: {
      example: {
        message: '3 issue(s) permanently deleted',
        deletedCount: 3,
        deletedIds: [1, 2, 3],
      },
    },
  })
  bulkPermanentDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.issuesService.bulkPermanentDelete(bulkDeleteDto.ids);
  }

  @Patch('bulk/restore')
  @ApiOperation({
    summary: 'Restore multiple deleted issues',
    description: 'Restores multiple soft-deleted issues from the recycle bin in a single operation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Issues restored successfully.',
    schema: {
      example: {
        message: '3 issue(s) restored successfully',
        restoredCount: 3,
        issues: [
          {
            id: 1,
            title: 'Login page throws 500 error',
            description: 'Users see a 500 error after submitting valid credentials.',
            status: 'open',
            priority: 'high',
            createdAt: '2026-06-13T09:30:00.000Z',
            updatedAt: '2026-06-13T10:20:00.000Z',
            deletedAt: null,
          },
        ],
      },
    },
  })
  bulkRestore(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.issuesService.bulkRestore(bulkDeleteDto.ids);
  }
}
