import { Controller, Get, Post, Body, Query } from '@nestjs/common';

import { EntrepreneurService } from './entrepreneur.service';
import { UpdateEntrepreneurInfoDto } from './dto/update-entrepreneur-info';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneur.dto';

@Controller('entrepreneur')
export class EntrepreneurController {
  constructor(private readonly entrepreneurService: EntrepreneurService) {}

  @Get('get-data-by-email')
  getDataByEmail(@Query() updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    return this.entrepreneurService.getDataByEmail(updateEntrepreneurInfoDto);
  }

  @Get('get-data-by-id')
  getDataById(@Query() updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    return this.entrepreneurService.getDataById(updateEntrepreneurInfoDto);
  }

  @Post('update-entrepreneur-info')
  updateEntrepreneurInfo(@Body() updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    return this.entrepreneurService.updateEntrepreneurInfo(updateEntrepreneurInfoDto);
  }

  @Post('update')
  update(@Body() updateEntrepreneurDto: UpdateEntrepreneurDto) {
    this.entrepreneurService.update(updateEntrepreneurDto);
  }
}
