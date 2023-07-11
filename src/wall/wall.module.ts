import { Module } from '@nestjs/common';
import { WallService } from './wall.service';
import { WallController } from './wall.controller';
import { DatabaseService } from 'src/database/database.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [WallController],
  providers: [WallService]
})
export class WallModule {}
