import { Module } from '@nestjs/common';
import { PitchDeckService } from './pitch-deck.service';
import { PitchDeckController } from './pitch-deck.controller';

@Module({
  controllers: [PitchDeckController],
  providers: [PitchDeckService]
})
export class PitchDeckModule {}
