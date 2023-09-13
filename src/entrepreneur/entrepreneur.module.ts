import { Module } from '@nestjs/common';
import { EntrepreneurService } from './entrepreneur.service';
import { EntrepreneurController } from './entrepreneur.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [EntrepreneurController],
  providers: [EntrepreneurService, DatabaseService],
  imports: [JwtModule]
})
export class EntrepreneurModule {}
