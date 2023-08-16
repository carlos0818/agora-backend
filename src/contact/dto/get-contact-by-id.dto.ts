import { IsString } from "class-validator";

export class GetContactByIdDto {
    @IsString()
    id: string;
}