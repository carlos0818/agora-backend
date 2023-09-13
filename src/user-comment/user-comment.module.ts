import { Module } from '@nestjs/common';
import { UserCommentService } from './user-comment.service';
import { UserCommentController } from './user-comment.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [UserCommentController],
  providers: [UserCommentService, DatabaseService]
})
export class UserCommentModule {}
