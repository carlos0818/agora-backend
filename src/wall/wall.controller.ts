import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { WallService } from './wall.service';
import { AgoraMessage } from './dto/agoraMessage.dto';
import { CloseAgoraMessage } from './dto/closeAgoraMessage.dto';
import { SaveUserPostDto } from './dto/saveUserPost';
import { CommentPost } from './dto/comment-post.dto';
import { SaveLikeDto } from './dto/save-like.dto';

@Controller('wall')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  @Get('agora-messages')
  // @UseGuards(AuthGuard())
  listAgoraMessages(@Query() agoraMessage: AgoraMessage) {
    return this.wallService.listAgoraMessages(agoraMessage);
  }

  @Get('user-posts')
  listUserPosts(@Query() agoraMessage: AgoraMessage) {
    return this.wallService.listUserPosts(agoraMessage);
  }

  @Post('close-agora-message')
  closeAgoraMessage(@Body() closeAgoraMessage: CloseAgoraMessage) {
    return this.wallService.closeAgoraMessage(closeAgoraMessage);
  }

  @Post('save-user-post')
  savePost(@Body() saveUserPost: SaveUserPostDto) {
    return this.wallService.savePost(saveUserPost);
  }

  @Post('save-comment-post')
  saveCommentPost(@Body() commentPost: CommentPost) {
    return this.wallService.saveCommentPost(commentPost);
  }

  @Post('save-like-post')
  saveLikePost(@Body() saveLikeDto: SaveLikeDto) {
    return this.wallService.saveLikePost(saveLikeDto);
  }
}
