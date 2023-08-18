import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';

import { InvestorService } from './investor.service';
import { UpdateInvestorDto } from './dto/update-investor.dto';
import { UpdateInvestorInfoDto } from './dto/update-investor-info';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { SearchDto } from './dto/search.dto';
import { ShowNotificationDto } from './dto/show-notification.dto';

@Controller('investor')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Get('get-data-by-email')
  getDataByEmail(@Query() updateInvestorInfoDto: UpdateInvestorInfoDto) {
    return this.investorService.getDataByEmail(updateInvestorInfoDto);
  }

  @Get('get-data-by-id')
  getDataById(@Query() getDataByIdDto: GetDataByIdDto) {
    return this.investorService.getDataById(getDataByIdDto);
  }

  @Post('update-investor-info')
  updateInvestorInfo(@Body() updateInvestorInfoDto: UpdateInvestorInfoDto) {
    return this.investorService.updateInvestorInfo(updateInvestorInfoDto);
  }

  @Post('update')
  update(@Body() updateInvestorDto: UpdateInvestorDto) {
    return this.investorService.update(updateInvestorDto);
  }

  @Get('validate-required-data')
  validateRequiredData(@Query() getDataByIdDto: GetDataByIdDto, @Req() req: Request) {
    const token = req.headers.authorization ? req.headers?.authorization.split(' ')[1] : '';
    return this.investorService.validateRequiredData(getDataByIdDto, token);
  }

  @Get('search')
  search(@Query() searchDto: SearchDto) {
    return this.investorService.search(searchDto);
  }

  @Get('show-notifications-15-ago')
  showNotifications15Ago(@Query() showNotificationDto: ShowNotificationDto) {
    return this.investorService.showNotifications15Ago(showNotificationDto);
  }

  @Get('show-notifications')
  showNotifications(@Query() showNotificationDto: ShowNotificationDto) {
    return this.investorService.showNotifications(showNotificationDto);
  }

  @Post('update-show-notifications')
  updateShowNotifications(@Body() showNotificationDto: ShowNotificationDto) {
    return this.investorService.updateShowNotifications(showNotificationDto);
  }
}
