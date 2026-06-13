import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { IssueAnalysisDto } from './dto/issue-analysis.dto';

@ApiTags('AI Analysis')
@Controller('issues/:issueId')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Generate AI analysis for an issue',
    description:
      'Builds a fresh Gemini analysis using the issue details and full comment history.',
  })
  @ApiParam({ name: 'issueId', type: Number, example: 12 })
  @ApiResponse({
    status: 200,
    description: 'AI analysis generated successfully.',
    type: IssueAnalysisDto,
    example: {
      issueId: 12,
      summary: 'Login is failing for valid users after a recent deployment.',
      severity: 'high',
      possibleCauses: [
        'Authentication environment variables may be misconfigured.',
        'A backend service change may have broken login validation.',
      ],
      recommendedActions: [
        'Check authentication service logs.',
        'Verify deployment environment variables.',
        'Test login flow in staging and production.',
      ],
      missingInformation: [
        'Exact error message from logs',
        'Whether all users are affected or only some roles',
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  @ApiResponse({
    status: 502,
    description: 'Gemini request failed or returned an invalid response.',
  })
  analyze(@Param('issueId', ParseIntPipe) issueId: number) {
    return this.aiService.analyzeIssue(issueId);
  }
}
