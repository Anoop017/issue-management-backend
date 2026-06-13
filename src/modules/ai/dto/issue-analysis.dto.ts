import { ApiProperty } from '@nestjs/swagger';

export class IssueAnalysisDto {
  @ApiProperty({ example: 12 })
  issueId: number;

  @ApiProperty({
    example: 'Login is failing for valid users after a recent deployment.',
  })
  summary: string;

  @ApiProperty({
    example: 'high',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({
    type: [String],
    example: [
      'Authentication environment variables may be misconfigured.',
      'A backend service change may have broken login validation.',
    ],
  })
  possibleCauses: string[];

  @ApiProperty({
    type: [String],
    example: [
      'Check authentication service logs.',
      'Verify deployment environment variables.',
      'Test login flow in staging and production.',
    ],
  })
  recommendedActions: string[];

  @ApiProperty({
    type: [String],
    example: [
      'Exact error message from logs',
      'Whether all users are affected or only some roles',
    ],
  })
  missingInformation: string[];
}
