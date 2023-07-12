import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateEntrepreneurDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    email_contact: string;

    @IsString()
    phone: string;

    @IsString()
    country: string;

    @IsString()
    city: string;

    @IsString()
    address: string;

    @IsString()
    profilepic: string;

    @IsString()
    backpic: string;

    @IsString()
    videourl: string;

    @IsString()
    web: string;

    @IsString()
    facebook: string;

    @IsString()
    linkedin: string;

    @IsString()
    twitter: string;
}
