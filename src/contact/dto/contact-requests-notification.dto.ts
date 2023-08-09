import { IsString, IsEmail } from "class-validator";

export class ContactRequestsNotificationDto {
    @IsString()
    @IsEmail()
    email: string;
}
