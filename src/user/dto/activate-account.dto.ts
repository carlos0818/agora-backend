import { IsEmail, IsString } from "class-validator";

export class ActivateAccountDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    token: string;
}
