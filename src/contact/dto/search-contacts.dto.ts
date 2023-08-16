import { IsString, IsEmail } from "class-validator";

export class SearchContactsDto {
    @IsString()
    @IsEmail()
    email: string;
}
