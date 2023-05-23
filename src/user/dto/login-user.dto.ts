import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(10)
    @Matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter, a number and special character'
    })
    password: string;
}
