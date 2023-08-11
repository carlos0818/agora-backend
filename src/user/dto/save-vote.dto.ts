import { IsString, IsEmail } from "class-validator";

export class SaveVoteDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    id: string;

    @IsString()
    vote: string;
}
