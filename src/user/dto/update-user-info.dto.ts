import { IsString, IsEmail } from "class-validator";

export class UpdateUserInfoDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    fullname: string;
}