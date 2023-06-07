import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class SaveQuestionDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    qnbr: string;

    @IsString()
    anbr: string;

    @IsString()
    effdt: string;

    @IsString()
    @IsOptional()
    extravalue: string
}