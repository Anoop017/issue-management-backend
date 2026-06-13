import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  issuePriorities,
  issueStatuses,
  type IssuePriority,
  type IssueStatus,
} from '../../../database/schema/issues.schema';

export const issueSortFields = ['createdAt', 'updatedAt', 'title', 'priority'] as const;
export const sortOrders = ['asc', 'desc'] as const;

export type IssueSortField = (typeof issueSortFields)[number];
export type SortOrder = (typeof sortOrders)[number];

export class ListIssuesQueryDto {
  @ApiPropertyOptional({
    description: 'Search issues by title or description',
    example: 'login',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: issueStatuses,
    description: 'Filter issues by status',
    example: 'open',
  })
  @IsOptional()
  @IsIn(issueStatuses)
  status?: IssueStatus;

  @ApiPropertyOptional({
    enum: issuePriorities,
    description: 'Filter issues by priority',
    example: 'high',
  })
  @IsOptional()
  @IsIn(issuePriorities)
  priority?: IssuePriority;

  @ApiPropertyOptional({
    description: 'Page number starting from 1',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: 'Number of issues per page',
    example: 10,
    default: 10,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({
    enum: issueSortFields,
    description: 'Field used to sort issues',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(issueSortFields)
  sortBy: IssueSortField = 'createdAt';

  @ApiPropertyOptional({
    enum: sortOrders,
    description: 'Sort direction',
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(sortOrders)
  order: SortOrder = 'desc';
}
