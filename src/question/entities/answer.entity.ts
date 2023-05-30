import { ApiProperty } from "@nestjs/swagger";

export class Answer {
    @ApiProperty({
        example: 1,
        description: 'Question ID',
        required: true,
        type: Number,
    })
    qnbr: number;

    @ApiProperty({
        example: '1900-01-01 00:00:00',
        description: 'Effective date',
        required: true,
        type: String,
    })
    effdt: string;

    @ApiProperty({
        example: 1,
        description: 'Answer ID',
        required: true,
        type: Number,
    })
    anbr: number;

    @ApiProperty({
        example: 'A',
        description: 'Question status (A: Active, I: Inactive)',
        required: true,
        type: String,
    })
    status: string;

    @ApiProperty({
        example: 0.35,
        description: 'Question score',
        required: true,
        type: Number,
    })
    score: number;

    @ApiProperty({
        example: 'Positive',
        description: 'Question description',
        required: true,
        type: String,
    })
    descr: string;

    @ApiProperty({
        example: '1,45,65,68',
        description: 'Questions IDs comma separated to show',
        required: false,
        type: String,
    })
    show: string;

    @ApiProperty({
        example: '30,31,50,54',
        description: 'Questions IDs comma separated to hide',
        required: false,
        type: String,
    })
    hide: string;

    @ApiProperty({
        example: 10,
        description: 'show answer order',
        required: true,
        type: Number,
    })
    orderby: number;
}
