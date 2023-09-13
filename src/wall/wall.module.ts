import { Module } from '@nestjs/common';
import { WallService } from './wall.service';
import { WallController } from './wall.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [WallController],
  providers: [WallService, DatabaseService]
})
export class WallModule {}
