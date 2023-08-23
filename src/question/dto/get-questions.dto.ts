import { IsString } from "class-validator";

export class GetQuestionsDto {
    @IsString()
    lang: string;
}