import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService, DatabaseService],
  exports: [QuestionService],
  imports: [HttpModule]
})
export class QuestionModule {}
