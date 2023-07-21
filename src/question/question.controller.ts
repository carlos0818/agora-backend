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

  @Get('entrepreneur')
  @ApiResponse({ status: 200, description: 'List of questions', type: [Question] })
  listQuestionsEntrepreneur() {
    return this.questionService.listQuestionsEntrepreneur();
  }

  @Get('investor')
  @ApiResponse({ status: 200, description: 'List of questions', type: [Question] })
  listQuestionsInvestor() {
    return this.questionService.listQuestionsInvestor();
  }

  @Get('expert')
  @ApiResponse({ status: 200, description: 'List of questions', type: [Question] })
  listQuestionsExpert() {
    return this.questionService.listQuestionsExpert();
  }

  @Get('answer-entrepreneur')
  @ApiResponse({ status: 200, description: 'List of answers', type: [Answer] })
  listAnswersEntrepreneur() {
    return this.questionService.listAnswersEntrepreneur();
  }

  @Get('answer-investor')
  @ApiResponse({ status: 200, description: 'List of answers', type: [Answer] })
  listAnswersInvestor() {
    return this.questionService.listAnswersInvestor();
  }

  @Get('answer-expert')
  @ApiResponse({ status: 200, description: 'List of answers', type: [Answer] })
  listAnswersExpert() {
    return this.questionService.listAnswersExpert();
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
  saveUserQuestionEntrepreneur(@Body() saveQuestionDto: SaveQuestionDto) {
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

  @Post('submit-questionnaire-entrepreneur')
  submitQuestionnaireEntrepreneur(@Body() submitQuestionnaire: SubmitQuestionnaire) {
    return this.questionService.submitQuestionnaireEntrepreneur(submitQuestionnaire);
  }

  @Post('submit-questionnaire-investor')
  submitQuestionnaireInvestor(@Body() submitQuestionnaire: SubmitQuestionnaire) {
    return this.questionService.submitQuestionnaireInvestor(submitQuestionnaire);
  }

  @Post('submit-questionnaire-expert')
  submitQuestionnaireExpert(@Body() submitQuestionnaire: SubmitQuestionnaire) {
    return this.questionService.submitQuestionnaireExpert(submitQuestionnaire);
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
