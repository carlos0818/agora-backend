import { IsEmail, IsString } from "class-validator";

export class AnswerQuestionDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    question: string;

    @IsString()
    numbers: string;

    @IsString()
    type: string;
}