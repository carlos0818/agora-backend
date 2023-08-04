import { IsEmail, IsOptional, IsString } from "class-validator";

export class GetContactsByEmailDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    term: string
}