import { IsEmail, IsString } from "class-validator";

export class LoginTokenDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    token: string;
}
