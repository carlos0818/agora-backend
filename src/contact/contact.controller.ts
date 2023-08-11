import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ContactService } from './contact.service';
import { GetContactsByEmailDto } from './dto/get-contacts.dto';
import { DeleteContactDto } from './dto/delete-contact.dto';
import { ContactRequestsNotificationDto } from './dto/contact-requests-notification.dto';
import { ValidateFriendDto } from './dto/validate-friend.dto';
import { ContactVoteDto } from './dto/contact-vote.dto';


@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('get-contacts-by-email')
  getContactsByEmail(@Query() getContactsByEmailDto: GetContactsByEmailDto) {
    return this.contactService.getContactsByEmail(getContactsByEmailDto);
  }

  @Get('get-contact-requests-by-email')
  getContactRequestsByEmail(@Query() getContactsByEmailDto: GetContactsByEmailDto) {
    return this.contactService.getContactRequestsByEmail(getContactsByEmailDto);
  }

  @Post('delete-contact')
  deleteContact(@Body() deleteContactDto: DeleteContactDto) {
    return this.contactService.deleteContact(deleteContactDto);
  }

  @Post('accept-contact')
  acceptContact(@Body() deleteContactDto: DeleteContactDto) {
    return this.contactService.acceptContact(deleteContactDto);
  }

  @Post('send-request')
  sendRequest(@Body() deleteContactDto: DeleteContactDto) {
    return this.contactService.sendRequest(deleteContactDto);
  }

  @Get('check-send-request')
  checkSendRequest(@Query() deleteContactDto: DeleteContactDto) {
    return this.contactService.checkSendRequest(deleteContactDto);
  }

  @Get('get-contact-requests-notification')
  getContactRequestsNotification(@Query() contactRequestsNotificationDto: ContactRequestsNotificationDto) {
    return this.contactService.getContactRequestsNotification(contactRequestsNotificationDto);
  }

  @Get('validate-friend')
  validateFriend(@Query() validateFriendDto: ValidateFriendDto) {
    return this.contactService.validateFriend(validateFriendDto);
  }

  @Post('contact-vote')
  contactVote(@Body() contactVoteDto: ContactVoteDto) {
    return this.contactService.contactVote(contactVoteDto);
  }
}
