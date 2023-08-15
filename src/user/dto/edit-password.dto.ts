import { IsEmail, IsString } from "class-validator";

export class EditPasswordDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    currentPassword: string;

    @IsString()
    newPassword: string;
}