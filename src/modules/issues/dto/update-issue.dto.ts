import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateIssueDto } from './create-issue.dto';
import {
  issuePriorities,
  issueStatuses,
  type IssuePriority,
  type IssueStatus,
} from '../../../database/schema/issues.schema';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  @ApiPropertyOptional({
    enum: issueStatuses,
    example: 'in-progress',
    description: 'Current workflow status of the issue',
  })
  @IsOptional()
  @IsString()
  @IsIn(issueStatuses)
  status?: IssueStatus;

  @ApiPropertyOptional({
    enum: issuePriorities,
    example: 'low',
    description: 'Priority of the issue',
  })
  @IsOptional()
  @IsString()
  @IsIn(issuePriorities)
  priority?: IssuePriority;
}
