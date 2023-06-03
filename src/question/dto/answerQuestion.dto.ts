import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class AnswerQuestionDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    type: string;

    @IsNumber()
    qnbr: string;

    @IsString()
    qeffdt: string;

    @IsNumber()
    anbr: string;

    @IsString()
    @IsOptional()
    effdt: string;

    @IsString()
    @IsOptional()
    extravalue: string
}