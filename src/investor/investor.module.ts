import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InvestorService } from './investor.service';
import { InvestorController } from './investor.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [InvestorController],
  providers: [InvestorService, DatabaseService],
  imports: [JwtModule]
})
export class InvestorModule {}
