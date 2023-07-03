import { IsEmail, IsString } from "class-validator";

export class SaveUserPost {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    body: string;
}