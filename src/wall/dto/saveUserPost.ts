import { IsEmail, IsString } from "class-validator";

export class SaveUserPostDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    body: string;
}