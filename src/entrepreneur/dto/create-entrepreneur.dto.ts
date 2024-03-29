import { IsEmail, IsOptional, IsString } from "class-validator";

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
    @IsOptional()
    backpic: string;

    @IsString()
    @IsOptional()
    videourl: string;

    @IsString()
    web: string;

    @IsString()
    @IsOptional()
    facebook: string;

    @IsString()
    @IsOptional()
    linkedin: string;

    @IsString()
    @IsOptional()
    twitter: string;
}
