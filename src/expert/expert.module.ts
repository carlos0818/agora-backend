import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ExpertService } from './expert.service';
import { ExpertController } from './expert.controller';

@Module({
  controllers: [ExpertController],
  providers: [ExpertService],
  imports: [JwtModule]
})
export class ExpertModule {}
