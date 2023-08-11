import { IsString, IsEmail } from "class-validator";

export class ContactVoteDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    id: string;

    @IsString()
    vote: string;
}
