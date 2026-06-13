import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  issuePriorities,
  type IssuePriority,
} from '../../../database/schema/issues.schema';

export class CreateIssueDto {
  @ApiProperty({
    example: 'Login page throws 500 error',
    description: 'Short title for the issue',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Users see a 500 error after submitting valid credentials.',
    description: 'Detailed description of the issue',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    enum: issuePriorities,
    example: 'high',
    description: 'Priority of the issue',
    default: 'medium',
  })
  @IsOptional()
  @IsString()
  @IsIn(issuePriorities)
  priority?: IssuePriority;
}
