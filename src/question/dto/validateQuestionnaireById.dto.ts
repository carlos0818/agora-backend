import { IsString } from "class-validator";

export class ValidateQuestionnaireByIdDto {
    @IsString()
    id: string;
}