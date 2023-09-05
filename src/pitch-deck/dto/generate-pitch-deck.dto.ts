import { IsEmail, IsString } from "class-validator";

export class GeneratePitchDeckDto {
    @IsString()
    @IsEmail()
    email: string;
}