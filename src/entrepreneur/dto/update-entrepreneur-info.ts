import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateEntrepreneurInfoDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsEmail()
    @IsOptional()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    email_contact: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    profilepic: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    backpic: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    videourl: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    web: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    facebook: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    linkedin: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    twitter: string;
}
