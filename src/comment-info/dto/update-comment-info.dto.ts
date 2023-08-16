import { PartialType } from '@nestjs/swagger';
import { CreateCommentInfoDto } from './create-comment-info.dto';

export class UpdateCommentInfoDto extends PartialType(CreateCommentInfoDto) {}
