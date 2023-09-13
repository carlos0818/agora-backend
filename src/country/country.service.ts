import { Injectable } from '@nestjs/common';

import { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CountryService {
  constructor(
    private readonly databaseService: DatabaseService,
  ){}

  async findByCountry(id: string) {
    const conn = await this.databaseService.getConnection();

    const indicators = await conn.query<RowDataPacket[]>(`
      SELECT country_id "countryId", country_indicator_id "indicatorId", country_indicator_name "indicatorName",
      country_indicator_year "indicatorYear", ROUND(country_indicator_value, 2) "indicatorValue"
      FROM ag_countries_ind WHERE country_id=?
    `, [id]);

    await this.databaseService.closeConnection(conn);

    return indicators[0];
  }
}
