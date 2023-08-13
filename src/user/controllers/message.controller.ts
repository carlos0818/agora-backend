import { Controller, Get, Param, Query } from '@nestjs/common';

import { MessageService } from '../services/message.service';
import { GetUserMessagesDto } from '../dto/get-user-messages.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('get-user-messages')
  getUserMessages(@Query() getUserMessages: GetUserMessagesDto) {
    return this.messageService.getUserMessages(getUserMessages);
  }
}
