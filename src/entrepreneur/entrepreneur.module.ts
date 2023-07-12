import { Module } from '@nestjs/common';
import { EntrepreneurService } from './entrepreneur.service';
import { EntrepreneurController } from './entrepreneur.controller';

@Module({
  controllers: [EntrepreneurController],
  providers: [EntrepreneurService],
})
export class EntrepreneurModule {}
