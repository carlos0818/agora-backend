import { Module } from '@nestjs/common';
import { CommentInfoService } from './comment-info.service';
import { CommentInfoController } from './comment-info.controller';

import { HttpModule } from '@nestjs/axios';

import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [CommentInfoController],
  providers: [CommentInfoService, MailService],
  imports: [HttpModule]
})
export class CommentInfoModule {}
