import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { ContactService } from './contact.service';
import { GetContactsByEmailDto } from './dto/get-contacts.dto';


@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('get-contacts-by-email')
  getContactsByEmail(@Query() getContactsByEmailDto: GetContactsByEmailDto) {
    return this.contactService.getContactsByEmail(getContactsByEmailDto);
  }

  @Delete('delete-contact/:id')
  deleteContact(@Param('id') id: string) {
    return this.contactService.deleteContact(id);
  }
}
