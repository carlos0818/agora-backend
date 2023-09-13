import { Module } from '@nestjs/common';
import { CommentInfoService } from './comment-info.service';
import { CommentInfoController } from './comment-info.controller';

import { HttpModule } from '@nestjs/axios';

import { MailService } from 'src/mail/mail.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [CommentInfoController],
  providers: [CommentInfoService, MailService, DatabaseService],
  imports: [HttpModule]
})
export class CommentInfoModule {}
