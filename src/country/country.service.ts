import { Inject, Injectable } from '@nestjs/common';

import { Pool, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class CountryService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly pool: Pool,
  ){}

  async findByCountry(id: string) {
    const indicators = await this.pool.query<RowDataPacket[]>(`
      SELECT country_id "countryId", country_indicator_id "indicatorId", country_indicator_name "indicatorName",
      country_indicator_year "indicatorYear", ROUND(country_indicator_value, 2) "indicatorValue"
      FROM countries WHERE country_id=?
    `, [id]);

    return indicators[0];
  }
}
