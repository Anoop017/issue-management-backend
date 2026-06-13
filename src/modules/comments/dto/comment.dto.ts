import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  issueId: number;

  @ApiProperty({
    example: 'I reproduced this on the staging environment as well.',
  })
  content: string;

  @ApiPropertyOptional({ example: 'Anoop' })
  authorName: string | null;

  @ApiProperty({ example: '2026-06-13T10:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-13T10:15:00.000Z' })
  updatedAt: Date;
}
