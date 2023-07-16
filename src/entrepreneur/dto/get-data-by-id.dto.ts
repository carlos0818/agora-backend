import { IsString } from "class-validator";

export class GetDataByIdDto {
    @IsString()
    id: string;
}
