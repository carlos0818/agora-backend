import { PartialType } from '@nestjs/swagger';
import { CreateUserCommentDto } from './create-user-comment.dto';

export class UpdateUserCommentDto extends PartialType(CreateUserCommentDto) {}
