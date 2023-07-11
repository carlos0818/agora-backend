import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { WallService } from './wall.service';
import { AgoraMessage } from './dto/agoraMessage.dto';
import { CloseAgoraMessage } from './dto/closeAgoraMessage.dto';
import { SaveUserPost } from './dto/saveUserPost';

@Controller('wall')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  @Get('agora-messages')
  // @UseGuards(AuthGuard())
  listAgoraMessages(@Query() agoraMessage: AgoraMessage) {
    return this.wallService.listAgoraMessages(agoraMessage);
  }

  @Get('user-posts')
  listUserPosts() {
    return this.wallService.listUserPosts();
  }

  @Post('close-agora-message')
  closeAgoraMessage(@Body() closeAgoraMessage: CloseAgoraMessage) {
    return this.wallService.closeAgoraMessage(closeAgoraMessage);
  }

  @Post('save-user-post')
  savePost(@Body() saveUserPost: SaveUserPost) {
    return this.wallService.savePost(saveUserPost);
  }
}
