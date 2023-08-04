import { IsEmail, IsOptional, IsString } from "class-validator";

export class DeleteContactDto {
    @IsString()
    id: string;

    @IsString()
    @IsEmail()
    email: string;
}