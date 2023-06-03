import { Module } from '@nestjs/common';
import { WallService } from './wall.service';
import { WallController } from './wall.controller';

@Module({
  controllers: [WallController],
  providers: [WallService]
})
export class WallModule {}
