import { IsEmail, IsString } from "class-validator";

export class SubmitQuestionnaire {
    @IsString()
    @IsEmail()
    email: string;
}