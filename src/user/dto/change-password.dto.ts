import { IsEmail, IsString } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    token: string;

    @IsString()
    captcha: string;
}
