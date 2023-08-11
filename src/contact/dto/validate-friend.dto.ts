import { IsString, IsEmail } from "class-validator";

export class ValidateFriendDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    id: string;
}