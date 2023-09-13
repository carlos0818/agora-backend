import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [CountryController],
  providers: [CountryService, DatabaseService]
})
export class CountryModule {}
