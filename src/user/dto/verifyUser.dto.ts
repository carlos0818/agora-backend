import { IsEmail, IsString} from "class-validator";

export class VerifyUserDto {
    @IsString()
    @IsEmail()
    email: string;
}