import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PitchDeckService } from './pitch-deck.service';
import { PitchDeckController } from './pitch-deck.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [HttpModule],
  controllers: [PitchDeckController],
  providers: [PitchDeckService, DatabaseService]
})
export class PitchDeckModule {}
