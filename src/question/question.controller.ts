import { Controller, Get } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  listQuestions() {
    return this.questionService.listQuestions();
  }

  @Get('answer')
  listAnswers() {
    return this.questionService.listAnswers();
  }
}
