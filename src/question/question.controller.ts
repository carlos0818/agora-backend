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
import { SubmitQuestionnaire } from './dto/submitQuestionnaire.dto';
import { ValidateQuestionnaireByEmailDto } from './dto/validateQuestionnaireByEmail.dto';
import { ValidateQuestionnaireByIdDto } from './dto/validateQuestionnaireById.dto';

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

  @Get('user-answers')
  userAnswers(@Query() userAnswers: UserAnswers) {
    return this.questionService.userAnswers(userAnswers);
  }

  @Get('get-user-question-version')
  getUserQuestionVersion(@Query() submitQuestionnaire: SubmitQuestionnaire) {
    return this.questionService.getUserQuestionVersion(submitQuestionnaire.email);
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

  @Post('submit-questionnaire')
  submitQuestionnaire(@Body() submitQuestionnaire: SubmitQuestionnaire) {
    return this.questionService.submitQuestionnaire(submitQuestionnaire);
  }

  @Get('validate-complete-questionnaire-by-email')
  validateCompleteQuestionnaireByEmail(@Query() submitQuestionnaire: SubmitQuestionnaire) {
    return this.questionService.validateCompleteQuestionnaireByEmail(submitQuestionnaire);
  }

  @Get('validate-complete-questionnaire-by-id')
  validateCompleteQuestionnaireById(@Query() validateQuestionnaireByIdDto: ValidateQuestionnaireByIdDto) {
    return this.questionService.validateCompleteQuestionnaireById(validateQuestionnaireByIdDto);
  }
}
