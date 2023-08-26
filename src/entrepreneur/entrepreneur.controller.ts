import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';

import { EntrepreneurService } from './entrepreneur.service';
import { UpdateEntrepreneurInfoDto } from './dto/update-entrepreneur-info';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneur.dto';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { SearchDto } from './dto/search.dto';
import { ShowNotificationDto } from './dto/show-notification.dto';

@Controller('entrepreneur')
export class EntrepreneurController {
  constructor(private readonly entrepreneurService: EntrepreneurService) {}

  @Get('get-data-by-email')
  getDataByEmail(@Query() updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    return this.entrepreneurService.getDataByEmail(updateEntrepreneurInfoDto);
  }

  @Get('get-data-by-id')
  getDataById(@Query() getDataByIdDto: GetDataByIdDto) {
    return this.entrepreneurService.getDataById(getDataByIdDto);
  }

  @Post('update-entrepreneur-info')
  updateEntrepreneurInfo(@Body() updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    return this.entrepreneurService.updateEntrepreneurInfo(updateEntrepreneurInfoDto);
  }

  @Post('update')
  update(@Body() updateEntrepreneurDto: UpdateEntrepreneurDto) {
    return this.entrepreneurService.update(updateEntrepreneurDto);
  }

  @Get('validate-required-data')
  validateRequiredData(@Query() getDataByIdDto: GetDataByIdDto, @Req() req: Request) {
    const token = req.headers.authorization ? req.headers?.authorization.split(' ')[1] : '';
    return this.entrepreneurService.validateRequiredData(getDataByIdDto, token);
  }

  @Get('get-company-size')
  getCompanySize() {
    return this.entrepreneurService.getCompanySize();
  }

  @Get('search')
  search(@Query() searchDto: SearchDto) {
    return this.entrepreneurService.search(searchDto);
  }

  @Get('show-notifications-15-ago')
  showNotifications15Ago(@Query() showNotificationDto: ShowNotificationDto) {
    return this.entrepreneurService.showNotifications15Ago(showNotificationDto);
  }

  @Get('show-notifications')
  showNotifications(@Query() showNotificationDto: ShowNotificationDto) {
    return this.entrepreneurService.showNotifications(showNotificationDto);
  }

  @Post('update-show-notifications')
  updateShowNotifications(@Body() showNotificationDto: ShowNotificationDto) {
    return this.entrepreneurService.updateShowNotifications(showNotificationDto);
  }

  @Get('get-score')
  getScore(@Query() showNotificationDto: ShowNotificationDto) {
    return this.entrepreneurService.getScore(showNotificationDto);
  }

  @Post('generate-about-us')
  generateAboutUs(@Body() showNotificationDto: ShowNotificationDto) {
    return this.entrepreneurService.generateAboutUs(showNotificationDto);
  }
}
