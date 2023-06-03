import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class UserAnswers {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    type: string;
}