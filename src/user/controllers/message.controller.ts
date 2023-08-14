import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { MessageService } from '../services/message.service';
import { GetUserMessagesDto } from '../dto/get-user-messages.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { DeleteMessageDto } from '../dto/delete-message.dto';
import { VerifyUserDto } from '../dto/verifyUser.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('get-user-messages')
  getUserMessages(@Query() getUserMessages: GetUserMessagesDto) {
    return this.messageService.getUserMessages(getUserMessages);
  }

  @Post('send-message')
  sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.messageService.sendMessage(sendMessageDto);
  }

  @Post('delete-message')
  deleteMessage(@Body() deleteMessageDto: DeleteMessageDto) {
    return this.messageService.deleteMessage(deleteMessageDto);
  }

  @Get('get-messages-notification')
  getMessagesNotification(@Query() verifyUserDto: VerifyUserDto) {
    return this.messageService.getMessagesNotification(verifyUserDto);
  }

  @Post('read-message')
  readMessage(@Body() deleteMessageDto: DeleteMessageDto) {
    return this.messageService.readMessage(deleteMessageDto);
  }
}
