import { IsString } from "class-validator";

export class GetUserCommentDto {
    @IsString()
    id: string;
}