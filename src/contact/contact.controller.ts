import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ContactService } from './contact.service';
import { GetContactsByEmailDto } from './dto/get-contacts.dto';
import { DeleteContactDto } from './dto/delete-contact.dto';


@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('get-contacts-by-email')
  getContactsByEmail(@Query() getContactsByEmailDto: GetContactsByEmailDto) {
    return this.contactService.getContactsByEmail(getContactsByEmailDto);
  }

  @Post('delete-contact')
  deleteContact(@Body() deleteContactDto: DeleteContactDto) {
    return this.contactService.deleteContact(deleteContactDto);
  }
}
