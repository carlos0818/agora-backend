import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';

import { InvestorService } from './investor.service';
import { UpdateInvestorDto } from './dto/update-investor.dto';
import { UpdateInvestorInfoDto } from './dto/update-investor-info';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';

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
}
