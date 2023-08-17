import { IsEmail, IsString } from "class-validator";

export class ShowNotificationDto {
    @IsString()
    @IsEmail()
    email: string;
}
