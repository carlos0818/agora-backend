import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommentInfoService } from './comment-info.service';
import { CreateCommentInfoDto } from './dto/create-comment-info.dto';

@Controller('comment-info')
export class CommentInfoController {
  constructor(private readonly commentInfoService: CommentInfoService) {}

  @Post('send-email')
  sendEmail(@Body() createCommentInfoDto: CreateCommentInfoDto) {
    return this.commentInfoService.sendEmail(createCommentInfoDto);
  }
}
