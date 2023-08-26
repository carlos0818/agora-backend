import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
  imports: [HttpModule]
})
export class QuestionModule {}
