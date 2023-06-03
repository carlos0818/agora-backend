import { ApiProperty } from "@nestjs/swagger";

export class Wall {
    @ApiProperty({
        example: 1,
        description: 'Message index',
        required: true,
        type: Number,
    })
    index: number;

    @ApiProperty({
        example: '2023-06-03 00:00:00',
        description: 'Message effective date',
        required: true,
        type: String,
    })
    effdt: string;

    @ApiProperty({
        example: 'Welcome to Agora',
        description: 'Message title',
        required: true,
        type: String,
    })
    title: string;

    @ApiProperty({
        example: 'Welcome to our platform',
        description: 'Message body',
        required: true,
        type: String,
    })
    body: string;

    @ApiProperty({
        example: '2023-06-03 00:00:00',
        description: 'Message date posted',
        required: true,
        type: String,
    })
    dateposted: string;

    @ApiProperty({
        example: 'https://google.com',
        description: 'Message link to redirect to other page',
        required: false,
        type: String,
    })
    link: string;
}
