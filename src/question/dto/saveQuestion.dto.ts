import { IsEmail, IsOptional, IsString } from "class-validator";

export class SaveQuestionDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    type: string;

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