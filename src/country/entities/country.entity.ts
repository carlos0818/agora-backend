import { ApiProperty } from "@nestjs/swagger";

export class Country {
    @ApiProperty({
        example: 'PER',
        description: 'Country ID',
        required: true,
        type: String,
    })
    id: string;

    @ApiProperty({
        example: 'PER',
        description: 'Indicator ID',
        required: true,
        type: Number,
    })
    indicatorId: number;

    @ApiProperty({
        example: 'PER',
        description: 'Economic growth',
        required: true,
        type: String,
    })
    indicatorName: string;

    @ApiProperty({
        example: 2022,
        description: 'Indicator year',
        required: true,
        type: Number,
    })
    indicatorYear: number;

    @ApiProperty({
        example: 13.35,
        description: 'Indicator value',
        required: true,
        type: Number,
    })
    indicatorValue: number;
}
