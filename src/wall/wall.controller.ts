import { Controller, Get, Query } from '@nestjs/common';
import { WallService } from './wall.service';
import { AgoraMessage } from './dto/agoraMessage.dto';

@Controller('wall')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  @Get('agora-messages')
  listAgoraMessages(@Query() agoraMessage: AgoraMessage) {
    return this.wallService.listAgoraMessages(agoraMessage);
  }
}
