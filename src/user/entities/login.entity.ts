import { ApiProperty } from "@nestjs/swagger";

export class Login {
    @ApiProperty({
        example: 'roberto@gmail.com',
        description: 'Email',
        required: true,
        type: String,
    })
    email: string;

    @ApiProperty({
        example: 'Roberto García',
        description: 'Fullname',
        required: true,
        type: String,
    })
    fullname: string;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByYWltdXM2NjZAZ21haWwuY29LIiwiaWF0IjoxNjg1MjM2NjQ3LCJleHAiOjE2ODUyNDM4NDd9.axJ7pOMRhnDSonUvkT-ZkUI45SRORhcv8lVNugIkCWo',
        description: 'First name',
        required: true,
        type: String,
    })
    token: string;
}
