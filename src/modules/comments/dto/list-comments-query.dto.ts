import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const commentSortFields = ['createdAt', 'updatedAt'] as const;
export const commentSortOrders = ['asc', 'desc'] as const;

export type CommentSortField = (typeof commentSortFields)[number];
export type CommentSortOrder = (typeof commentSortOrders)[number];

export class ListCommentsQueryDto {
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
    description: 'Number of comments per page',
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
    enum: commentSortFields,
    description: 'Field used to sort comments',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(commentSortFields)
  sortBy: CommentSortField = 'createdAt';

  @ApiPropertyOptional({
    enum: commentSortOrders,
    description: 'Sort direction',
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(commentSortOrders)
  order: CommentSortOrder = 'desc';
}
