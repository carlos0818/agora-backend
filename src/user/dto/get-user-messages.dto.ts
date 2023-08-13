import { IsString } from "class-validator";

export class GetUserMessagesDto {
    @IsString()
    id: string;
}
