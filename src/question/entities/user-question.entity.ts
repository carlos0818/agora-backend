import { ApiProperty } from "@nestjs/swagger";

export class UserQuestion {
    @ApiProperty({
        example: 'carlos.flores@gmail.com',
        description: 'User email',
        required: true,
        type: String,
    })
    email: string;

    @ApiProperty({
        example: 'E',
        description: 'Account type (E: Entrepreneur, I: Investor, X: Expert)',
        required: true,
        type: String,
    })
    type: string;

    @ApiProperty({
        example: 'A',
        description: 'Question number',
        required: true,
        type: Number,
    })
    qnbr: number;

    @ApiProperty({
        example: 'A',
        description: 'Question effective date',
        required: true,
        type: String,
    })
    qeffdt: string;

    @ApiProperty({
        example: 'A',
        description: 'Answer number',
        required: true,
        type: Number,
    })
    anbr: number;

    @ApiProperty({
        example: 'A',
        description: 'Effective now date',
        required: false,
        type: String,
    })
    effdt: string;

    @ApiProperty({
        example: 'A',
        description: 'Aditional extra value',
        required: false,
        type: String,
    })
    extravalue: string;
}
