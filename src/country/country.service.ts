import { Injectable } from '@nestjs/common';

import { InjectClient } from 'nest-mysql';
import { Connection, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class CountryService {
  constructor(
    @InjectClient('MySQL') private connection: Connection,
  ){}

  async findByCountry(id: string) {
    const indicators = await this.connection.query<RowDataPacket[]>(`
      SELECT country_id "countryId", country_indicator_id "indicatorId", country_indicator_name "indicatorName",
      country_indicator_year "indicatorYear", ROUND(country_indicator_value, 2) "indicatorValue"
      FROM countries WHERE country_id=?
    `, [id]);

    return indicators[0];
  }
}
