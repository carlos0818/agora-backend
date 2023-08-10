import { IsEmail, IsString } from "class-validator";

export class SaveLikeDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    index: string;
}