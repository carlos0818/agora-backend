import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InvestorService } from './investor.service';
import { InvestorController } from './investor.controller';

@Module({
  controllers: [InvestorController],
  providers: [InvestorService],
  imports: [JwtModule]
})
export class InvestorModule {}
