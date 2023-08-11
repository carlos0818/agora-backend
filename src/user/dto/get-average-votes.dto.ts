import { IsString } from "class-validator";

export class GetAverageVotesDto {
    @IsString()
    id: string;
}
