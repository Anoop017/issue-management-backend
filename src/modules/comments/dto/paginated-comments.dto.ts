import { ApiProperty } from '@nestjs/swagger';
import { CommentDto } from './comment.dto';

class CommentsPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class PaginatedCommentsDto {
  @ApiProperty({ type: CommentDto, isArray: true })
  data: CommentDto[];

  @ApiProperty({ type: CommentsPaginationMetaDto })
  meta: CommentsPaginationMetaDto;
}
