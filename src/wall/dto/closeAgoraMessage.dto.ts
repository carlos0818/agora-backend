import { IsEmail, IsNumber, IsString } from "class-validator";

export class CloseAgoraMessage {
    @IsString()
    @IsEmail()
    email: string;

    @IsNumber()
    index: number;
}