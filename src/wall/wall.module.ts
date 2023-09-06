import { Module } from '@nestjs/common';
import { WallService } from './wall.service';
import { WallController } from './wall.controller';
// import { UserModule } from 'src/user/user.module';
import { DatabaseService } from 'src/database/database.service';

@Module({
  // imports: [UserModule],
  controllers: [WallController],
  providers: [WallService, DatabaseService]
})
export class WallModule {}
