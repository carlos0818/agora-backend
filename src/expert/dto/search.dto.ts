import { IsEmail, IsOptional, IsString } from "class-validator";

export class SearchDto {
    @IsString()
    @IsOptional()
    term: string;

    @IsString()
    @IsOptional()
    country: string;

    @IsString()
    @IsOptional()
    from: string;

    @IsString()
    @IsOptional()
    to: string;

    @IsString()
    @IsOptional()
    anbr: string;

    @IsString()
    @IsOptional()
    alphabetical: string;

    @IsString()
    @IsOptional()
    funding: string;

    @IsString()
    @IsOptional()
    expertise: string;

    @IsString()
    @IsOptional()
    @IsEmail()
    email: string;
}
