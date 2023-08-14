import { IsEmail, IsString } from "class-validator";

export class SendMessageDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsEmail()
    emailcontact: string;

    @IsString()
    status: string

    @IsString()
    subject: string

    @IsString()
    body: string

    @IsString()
    important: string

    @IsString()
    pitch: string
}
