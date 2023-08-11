import { IsEmail, IsString } from "class-validator";

export class VerifyVoteDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    id: string;
}
