import { IsEmail, IsString } from "class-validator";

export class AgoraMessage {
    @IsString()
    @IsEmail()
    email: string;
}