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
  type IssuePriority,
  type IssueStatus,
} from '../../database/schema/issues.schema';
import { CreateIssueDto } from './dto/create-issue.dto';
import { IssueDto } from './dto/issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssuesService } from './issues.service';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

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
  @ApiResponse({
    status: 200,
    description: 'Issues retrieved successfully.',
    type: IssueDto,
    isArray: true,
    example: [
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
  })
  findAll(
    @Query('status') status?: IssueStatus,
    @Query('priority') priority?: IssuePriority,
  ) {
    return this.issuesService.findAll({ status, priority });
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
    summary: 'Delete an issue',
    description: 'Deletes an issue by its unique identifier.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Issue deleted successfully.',
    schema: {
      example: {
        message: 'Issue deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.issuesService.remove(id);
  }
}
