import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { asc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { comments } from '../../database/schema/comments.schema';
import { IssuesService } from '../issues/issues.service';
import { IssueAnalysisDto } from './dto/issue-analysis.dto';

type ParsedIssueAnalysis = Omit<IssueAnalysisDto, 'issueId'>;

const ISSUE_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
    },
    severity: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
    },
    possibleCauses: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    recommendedActions: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    missingInformation: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: [
    'summary',
    'severity',
    'possibleCauses',
    'recommendedActions',
    'missingInformation',
  ],
} as const;

@Injectable()
export class AiService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly issuesService: IssuesService,
  ) {}

  async analyzeIssue(issueId: number): Promise<IssueAnalysisDto> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({ apiKey });

    const issue = await this.issuesService.findOne(issueId);
    const issueComments = await this.database
      .select()
      .from(comments)
      .where(eq(comments.issueId, issueId))
      .orderBy(asc(comments.createdAt), asc(comments.id));

    const prompt = this.buildPrompt(issue, issueComments);

    let modelText: string | undefined;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: ISSUE_ANALYSIS_SCHEMA,
          temperature: 0.2,
          maxOutputTokens: 600,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      modelText = response.text?.trim();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Gemini SDK error';
      throw new BadGatewayException(
        `Gemini analysis request failed: ${message}`,
      );
    }

    if (!modelText) {
      throw new BadGatewayException('Gemini returned an empty analysis');
    }

    const parsed = this.parseAnalysisResponse(modelText);

    return {
      issueId,
      ...parsed,
    };
  }

  private buildPrompt(
    issue: {
      title: string;
      description: string;
      status: string;
      priority: string;
      createdAt: Date;
      updatedAt: Date;
    },
    issueComments: Array<{
      content: string;
      authorName: string | null;
      createdAt: Date;
    }>,
  ) {
    const commentsSection =
      issueComments.length === 0
        ? 'No comments have been added yet.'
        : issueComments
            .map((comment, index) => {
              const author = comment.authorName ?? 'Unknown';
              return `${index + 1}. Author: ${author}\nCreated At: ${comment.createdAt.toISOString()}\nContent: ${comment.content}`;
            })
            .join('\n\n');

    return `
You are analyzing an issue from an issue management platform.

Issue Details:
- Title: ${issue.title}
- Description: ${issue.description}
- Status: ${issue.status}
- Priority: ${issue.priority}
- Created At: ${issue.createdAt.toISOString()}
- Updated At: ${issue.updatedAt.toISOString()}

Comments:
${commentsSection}

Return ONLY valid JSON with this exact structure:
{
  "summary": "string",
  "severity": "low | medium | high | critical",
  "possibleCauses": ["string"],
  "recommendedActions": ["string"],
  "missingInformation": ["string"]
}

Rules:
- Do not wrap the JSON in markdown.
- Keep summary concise.
- Use arrays for all list fields.
- If information is missing, say so in missingInformation.
    `.trim();
  }

  private parseAnalysisResponse(content: string): ParsedIssueAnalysis {
    const normalizedContent = this.extractJsonObject(content);

    try {
      const parsed = JSON.parse(normalizedContent) as Partial<ParsedIssueAnalysis>;

      return {
        summary: this.ensureString(parsed.summary, 'summary'),
        severity: this.ensureSeverity(parsed.severity),
        possibleCauses: this.ensureStringArray(
          parsed.possibleCauses,
          'possibleCauses',
        ),
        recommendedActions: this.ensureStringArray(
          parsed.recommendedActions,
          'recommendedActions',
        ),
        missingInformation: this.ensureStringArray(
          parsed.missingInformation,
          'missingInformation',
        ),
      };
    } catch {
      throw new BadGatewayException('Gemini returned invalid JSON analysis');
    }
  }

  private extractJsonObject(content: string) {
    const trimmed = content.trim();

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed;
    }

    const startIndex = trimmed.indexOf('{');
    const endIndex = trimmed.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      throw new BadGatewayException('Gemini response did not contain JSON');
    }

    return trimmed.slice(startIndex, endIndex + 1);
  }

  private ensureString(value: unknown, fieldName: string) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadGatewayException(`Gemini returned invalid ${fieldName}`);
    }

    return value.trim();
  }

  private ensureStringArray(value: unknown, fieldName: string) {
    if (!Array.isArray(value)) {
      throw new BadGatewayException(`Gemini returned invalid ${fieldName}`);
    }

    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private ensureSeverity(value: unknown): ParsedIssueAnalysis['severity'] {
    if (
      value === 'low' ||
      value === 'medium' ||
      value === 'high' ||
      value === 'critical'
    ) {
      return value;
    }

    throw new BadGatewayException('Gemini returned invalid severity');
  }
}
