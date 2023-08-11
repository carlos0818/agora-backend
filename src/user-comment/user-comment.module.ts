import { Module } from '@nestjs/common';
import { UserCommentService } from './user-comment.service';
import { UserCommentController } from './user-comment.controller';

@Module({
  controllers: [UserCommentController],
  providers: [UserCommentService]
})
export class UserCommentModule {}
