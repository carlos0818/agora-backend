import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WallService } from './wall.service';
import { AgoraMessage } from './dto/agoraMessage.dto';
import { CloseAgoraMessage } from './dto/closeAgoraMessage.dto';

@Controller('wall')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  @Get('agora-messages')
  listAgoraMessages(@Query() agoraMessage: AgoraMessage) {
    return this.wallService.listAgoraMessages(agoraMessage);
  }

  @Post('close-agora-message')
  closeAgoraMessage(@Body() closeAgoraMessage: CloseAgoraMessage) {
    return this.wallService.closeAgoraMessage(closeAgoraMessage);
  }
}
