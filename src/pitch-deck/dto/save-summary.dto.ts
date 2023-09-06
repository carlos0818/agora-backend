import { IsEmail, IsString } from "class-validator";

export class SaveSummaryDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    id: string;

    @IsString()
    text: string;
}