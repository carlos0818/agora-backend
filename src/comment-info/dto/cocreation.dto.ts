import { IsString } from "class-validator";

export class CocreationDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    category: string;

    @IsString()
    impact: string;

    @IsString()
    implementation: string;

    @IsString()
    contactInfo: string;

    @IsString()
    captcha: string;
}
