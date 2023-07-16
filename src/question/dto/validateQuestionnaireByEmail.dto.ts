import { IsEmail, IsString } from "class-validator";

export class ValidateQuestionnaireByEmailDto {
    @IsString()
    @IsEmail()
    email: string;
}