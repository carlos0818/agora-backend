import { IsString, IsEmail } from "class-validator";

export class CreateCommentInfoDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    fullname: string;

    @IsString()
    subject: string;

    @IsString()
    comment: string;

    @IsString()
    captcha: string;
}
