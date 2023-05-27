import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class ActivateAccountDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    token: string;
}
