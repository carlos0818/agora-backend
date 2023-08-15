import { IsEmail, IsString } from "class-validator";

export class SendLinkForgotPasswordDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    captcha: string;
}
