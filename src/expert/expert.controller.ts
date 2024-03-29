import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ExpertService } from './expert.service';

import { UpdateExpertInfoDto } from './dto/update-expert-info';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { SearchDto } from './dto/search.dto';
import { ShowNotificationDto } from './dto/show-notification.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Controller('expert')
export class ExpertController {
  constructor(private readonly expertService: ExpertService) {}

  @Get('get-data-by-email')
  getDataByEmail(@Query() updateExpertInfoDto: UpdateExpertInfoDto) {
    return this.expertService.getDataByEmail(updateExpertInfoDto);
  }

  @Get('get-data-by-id')
  getDataById(@Query() getDataByIdDto: GetDataByIdDto) {
    return this.expertService.getDataById(getDataByIdDto);
  }

  @Post('update-expert-info')
  updateExpertInfo(@Body() updateExpertInfoDto: UpdateExpertInfoDto) {
    return this.expertService.updateExpertInfo(updateExpertInfoDto);
  }

  @Post('update')
  update(@Body() updateExpertDto: UpdateExpertDto) {
    return this.expertService.update(updateExpertDto);
  }

  @Get('validate-required-data')
  validateRequiredData(@Query() getDataByIdDto: GetDataByIdDto, @Req() req: Request) {
    const token = req.headers.authorization ? req.headers?.authorization.split(' ')[1] : '';
    return this.expertService.validateRequiredData(getDataByIdDto, token);
  }

  @Get('search')
  search(@Query() searchDto: SearchDto) {
    return this.expertService.search(searchDto);
  }

  @Get('show-notifications-15-ago')
  showNotifications15Ago(@Query() showNotificationDto: ShowNotificationDto) {
    return this.expertService.showNotifications15Ago(showNotificationDto);
  }

  @Get('show-notifications')
  showNotifications(@Query() showNotificationDto: ShowNotificationDto) {
    return this.expertService.showNotifications(showNotificationDto);
  }

  @Post('update-show-notifications')
  updateShowNotifications(@Body() showNotificationDto: ShowNotificationDto) {
    return this.expertService.updateShowNotifications(showNotificationDto);
  }

  @Post('update-video')
  updateVideo(@Body() updateVideoDto: UpdateVideoDto) {
    return this.expertService.updateVideo(updateVideoDto);
  }
}
