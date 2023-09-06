import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PitchDeckService } from './pitch-deck.service';
import { PitchDeckController } from './pitch-deck.controller';

@Module({
  imports: [HttpModule],
  controllers: [PitchDeckController],
  providers: [PitchDeckService]
})
export class PitchDeckModule {}
