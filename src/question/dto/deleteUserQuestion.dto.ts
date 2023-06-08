import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class DeleteUserQuestionDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    qnbr: string;

    @IsString()
    anbr: string;

    @IsString()
    qeffdt: string;

    @IsString()
    qversion: string
}