import { ApiProperty } from '@nestjs/swagger';
import {
  issuePriorities,
  issueStatuses,
  type IssuePriority,
  type IssueStatus,
} from '../../../database/schema/issues.schema';

export class IssueDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Login page throws 500 error' })
  title: string;

  @ApiProperty({
    example: 'Users see a 500 error after submitting valid credentials.',
  })
  description: string;

  @ApiProperty({ enum: issueStatuses, example: 'open' })
  status: IssueStatus;

  @ApiProperty({ enum: issuePriorities, example: 'medium' })
  priority: IssuePriority;

  @ApiProperty({ example: '2026-06-13T09:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-13T09:30:00.000Z' })
  updatedAt: Date;
}
