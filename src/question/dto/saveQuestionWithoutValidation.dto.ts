import { IsEmail, IsOptional, IsString } from "class-validator";

export class SaveQuestionWithNoValidation {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    qnbr: string;

    @IsString()
    qeffdt: string;

    @IsString()
    anbr: string;

    @IsString()
    qversion: string;

    @IsString()
    @IsOptional()
    extravalue: string;
}