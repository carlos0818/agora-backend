import { ApiProperty } from "@nestjs/swagger";

export class Question {
    @ApiProperty({
        example: 1,
        description: 'Question ID',
        required: true,
        type: Number,
    })
    qnbr: number;

    @ApiProperty({
        example: 'PER',
        description: 'Effective date',
        required: true,
        type: String,
    })
    effdt: string;

    @ApiProperty({
        example: '1900-01-01 00:00:00',
        description: 'Question status',
        required: true,
        type: String,
    })
    status: string;

    @ApiProperty({
        example: 'Your company\'s location',
        description: 'Question description',
        required: true,
        type: String,
    })
    descr: string;

    @ApiProperty({
        example: 'https://videourl.com',
        description: 'Example video URL',
        required: false,
        type: String,
    })
    video: string;

    @ApiProperty({
        example: 10,
        description: 'Show question order',
        required: true,
        type: Number,
    })
    orderby: number;

    @ApiProperty({
        example: 'Q',
        description: 'Question type (Q: Question, T: Title)',
        required: true,
        type: String,
    })
    type: string;

    @ApiProperty({
        example: 'L',
        description: 'Alternatives type (L: List, M: Multiple, C: Select countries list, D: date control)',
        required: true,
        type: String,
    })
    object: string;

    @ApiProperty({
        example: '-',
        description: 'Bidimensional alternatives (-: last 3 years, +: next 3 years)',
        required: true,
        type: String,
    })
    bobject: string;
}
