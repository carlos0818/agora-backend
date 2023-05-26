import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterSocialUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    fullname: string;

    @IsString()
    @IsOptional()
    source: string;

    @IsString()
    type: string;

    @IsString()
    @IsOptional()
    language: string;

    @IsString()
    captcha: string;
}