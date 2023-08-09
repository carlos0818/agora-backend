import { IsEmail, IsString } from "class-validator";

export class CommentPost {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    index: string;

    @IsString()
    body: string;
}