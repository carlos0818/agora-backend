import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService, DatabaseService]
})
export class QuestionModule {}
