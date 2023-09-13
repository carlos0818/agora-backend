import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ExpertService } from './expert.service';
import { ExpertController } from './expert.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [ExpertController],
  providers: [ExpertService, DatabaseService],
  imports: [JwtModule]
})
export class ExpertModule {}
