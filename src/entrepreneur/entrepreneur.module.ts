import { Module } from '@nestjs/common';
import { EntrepreneurService } from './entrepreneur.service';
import { EntrepreneurController } from './entrepreneur.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [EntrepreneurController],
  providers: [EntrepreneurService],
  imports: [JwtModule]
})
export class EntrepreneurModule {}
