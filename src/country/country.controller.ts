import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { CountryService } from './country.service';
import { Country } from './entities/country.entity';

@ApiTags('Countries')
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'List of countries indicators', type: [Country] })
  findByCountry(@Param('id') id: string) {
    return this.countryService.findByCountry(id);
  }
}
