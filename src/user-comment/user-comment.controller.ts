import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserCommentService } from './user-comment.service';
import { GetUserCommentDto } from './dto/get-user-comment.dto';
import { SaveUserCommentDto } from './dto/save-user-comment.dto';

@Controller('user-comment')
export class UserCommentController {
  constructor(private readonly userCommentService: UserCommentService) {}

  @Get('get-user-comments')
  getUserComments(@Query() getUserCommentDto: GetUserCommentDto) {
    return this.userCommentService.getUserComments(getUserCommentDto);
  }

  @Post('save-user-comment')
  saveUserComment(@Body() saveUserCommentDto: SaveUserCommentDto) {
    return this.userCommentService.saveUserComment(saveUserCommentDto);
  }
}
