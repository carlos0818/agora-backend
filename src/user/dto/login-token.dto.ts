import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class LoginTokenDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    token: string;
}
