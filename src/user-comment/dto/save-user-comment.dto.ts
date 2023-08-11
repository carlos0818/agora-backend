import { IsString, IsEmail } from "class-validator";

export class SaveUserCommentDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    userId: string;

    @IsString()
    body: string;
}