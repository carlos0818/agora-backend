import { Controller, Get } from '@nestjs/common';
import { QuestionService } from './question.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';

@ApiTags('Questions')
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of questions', type: [Question] })
  listQuestions() {
    return this.questionService.listQuestions();
  }

  @Get('answer')
  @ApiResponse({ status: 200, description: 'List of answers', type: [Answer] })
  listAnswers() {
    return this.questionService.listAnswers();
  }
}
