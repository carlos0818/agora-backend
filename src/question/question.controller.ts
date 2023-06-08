import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { AnswerQuestionDto } from './dto/checkAnswerQuestion.dto';
import { UserAnswers } from './dto/userAnswers.dto';
import { SaveQuestionDto } from './dto/saveQuestion.dto';
import { DeleteUserQuestionDto } from './dto/deleteUserQuestion.dto';
import { SaveQuestionWithNoValidation } from './dto/saveQuestionWithoutValidation.dto';

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

  // @Get('check-answer-question')
  // // @ApiResponse({ status: 200, description: 'List of answers', type: [Answer] })
  // checkAnswerQuestion(@Query() answerQuestionDto: AnswerQuestionDto) {
  //   return this.questionService.checkAnswerQuestion(answerQuestionDto);
  // }

  @Get('user-answers')
  userAnswers(@Query() userAnswers: UserAnswers) {
    return this.questionService.userAnswers(userAnswers);
  }

  @Get('get-user-question-version')
  getUserQuestionVersion(@Query() email: string) {
    return this.questionService.getUserQuestionVersion(email);
  }

  @Post('save-question')
  saveUserQuestion(@Body() saveQuestionDto: SaveQuestionDto) {
    return this.questionService.saveUserQuestion(saveQuestionDto);
  }

  @Post('delete-question')
  deleteUserQuestion(@Body() deleteUserQuestionDto: DeleteUserQuestionDto) {
    return this.questionService.deleteUserQuestion(deleteUserQuestionDto);
  }

  @Post('save-question-without-validation')
  saveQuestionWithNoValidation(@Body() saveQuestionWithNoValidation: SaveQuestionWithNoValidation) {
    return this.questionService.saveQuestionWithNoValidation(saveQuestionWithNoValidation);
  }
}
