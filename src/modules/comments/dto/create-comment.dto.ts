import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'I reproduced this on the staging environment as well.',
    description: 'Comment body',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'Anoop',
    description: 'Optional author display name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorName?: string;
}
