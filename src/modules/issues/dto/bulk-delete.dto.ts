import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';

export class BulkDeleteDto {
    @ApiProperty({
        description: 'Array of issue IDs to delete',
        example: [1, 2, 3, 4, 5],
        type: [Number],
    })
    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true })
    ids: number[];
}
