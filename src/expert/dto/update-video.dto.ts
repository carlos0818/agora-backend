import { IsEmail, IsString } from "class-validator";

export class UpdateVideoDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    videoUrl: string;
}
