import { Controller, Get, Query } from '@nestjs/common';
import { WallService } from './wall.service';

@Controller('wall')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  @Get('agora-messages')
  listAgoraMessages(@Query() email: string) {
    return this.wallService.listAgoraMessages(email);
  }
}
