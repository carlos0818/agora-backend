import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { Country } from './entities/country.entity';

@Injectable()
export class CountryService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
  ){}

  async findByCountry(id: string) {
    const indicators = await this.clientPg.query<Country>(`
      SELECT country_id "countryId", country_indicator_id "indicatorId", country_indicator_name "indicatorName",
      country_indicator_year "indicatorYear", ROUND(country_indicator_value, 2) "indicatorValue"
      FROM countries WHERE country_id=$1
    `, [id]);

    return indicators.rows;
  }
}
