import { ApiProperty } from '@nestjs/swagger';
import { IssueDto } from './issue.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedIssuesDto {
  @ApiProperty({ type: IssueDto, isArray: true })
  data: IssueDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
