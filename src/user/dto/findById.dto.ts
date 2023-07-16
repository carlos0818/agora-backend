import { IsString } from "class-validator";

export class FindByIdDto {
    @IsString()
    id: string;
}