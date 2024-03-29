import { IsEmail, IsOptional, IsString } from "class-validator";

export class AnswerQuestionDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    type: string;

    @IsString()
    qnbr: string;

    @IsString()
    qeffdt: string;

    @IsString()
    anbr: string;

    @IsString()
    @IsOptional()
    effdt: string;

    @IsString()
    @IsOptional()
    extravalue: string
}