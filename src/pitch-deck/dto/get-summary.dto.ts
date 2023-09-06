import { IsString } from "class-validator";

export class GetSummaryDto {
    @IsString()
    id: string;
}