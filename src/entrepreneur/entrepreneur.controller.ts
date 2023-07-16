import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';

import { EntrepreneurService } from './entrepreneur.service';
import { UpdateEntrepreneurInfoDto } from './dto/update-entrepreneur-info';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneur.dto';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { Request } from 'express';

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
}
