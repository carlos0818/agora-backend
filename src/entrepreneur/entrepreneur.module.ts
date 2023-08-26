import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EntrepreneurService } from './entrepreneur.service';
import { EntrepreneurController } from './entrepreneur.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [EntrepreneurController],
  providers: [EntrepreneurService],
  imports: [
    HttpModule,
    JwtModule,
  ]
})
export class EntrepreneurModule {}
