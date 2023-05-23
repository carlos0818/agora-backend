import { ApiProperty } from "@nestjs/swagger";

export class User {
    @ApiProperty({
        example: 'carlos@gmail.com',
        description: 'Email',
        required: true,
        type: String,
    })
    email: string;

    @ApiProperty({
        example: 'Passw0rd$',
        description: 'Password',
        required: true,
        type: String,
    })
    password: string;

    @ApiProperty({
        example: true,
        description: 'Status account',
        required: true,
        type: Boolean,
    })
    status: boolean;

    @ApiProperty({
        example: 'E',
        description: 'Type account',
        required: true,
        type: String,
    })
    type: string;

    @ApiProperty({
        example: 'Carlos',
        description: 'First name',
        required: true,
        type: String,
    })
    firstname: string;

    @ApiProperty({
        example: 'Benavides',
        description: 'Lastname',
        required: true,
        type: String,
    })
    lastname: string;

    @ApiProperty({
        example: true,
        description: 'If account is verified',
        required: false,
        type: Boolean,
    })
    verified: boolean;

    @ApiProperty({
        example: 'en',
        description: 'Language',
        required: true,
        type: String,
    })
    language: string;

    @ApiProperty({
        example: '2023-05-04',
        description: 'Creation date',
        required: false,
        type: String,
    })
    creationDate: string;

    @ApiProperty({
        example: '2023-05-22',
        description: 'Indicator ID',
        required: false,
        type: String,
    })
    lastDate: string;

    @ApiProperty({
        example: '2023-05-22',
        description: 'Last login date',
        required: false,
        type: String,
    })
    lastLoginDate: string;

    @ApiProperty({
        example: '2023-05-20',
        description: 'Creation admin',
        required: false,
        type: String,
    })
    creationAdmin: string;
}
