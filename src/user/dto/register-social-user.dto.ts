import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterSocialUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    fullname: string;

    @IsString()
    source: string;

    @IsString()
    type: string;

    @IsString()
    @MinLength(10)
    @Matches(
        /(?:(?=.*\d)|([^A-Za-z0-9])(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have an Uppercase and lowercase letter, a number, and special character'
    })
    password: string;

    @IsString()
    @IsOptional()
    language: string;

    @IsString()
    captcha: string;
}