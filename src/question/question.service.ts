import { Inject, Injectable } from '@nestjs/common';

import { Client } from 'pg';

import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { AnswerQuestionDto } from './dto/checkAnswerQuestion.dto';
import { UserAnswers } from './dto/userAnswers.dto';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
  ){}

  async listQuestions() {
    const questions = await this.clientPg.query<Question>(`
      SELECT qnbr, effdt, descr, video, type, object, bobject, page FROM ag_entquest q
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=current_timestamp)
      ORDER BY q.page, q.orderby
    `);

    return questions.rows;
  }

  async listAnswers() {
    const answers = await this.clientPg.query<Answer>(`
      SELECT qnbr, effdt, anbr, status, score, descr, show, hide FROM ag_entans a WHERE a.status='A' ORDER BY a.orderby
    `);

    return answers.rows;
  }

  async userAnswers(userAnswers: UserAnswers) {
    const respUserAnswers = await this.clientPg.query(`
      SELECT a.qnbr, a.anbr FROM ag_user_quest a
      WHERE a.email=$1
      AND a.effdt=(SELECT MAX(a_ed.effdt) FROM ag_user_quest a_ed WHERE a.email=a_ed.email AND a.type=a_ed.type AND a.qnbr=a_ed.qnbr AND a.qeffdt=a_ed.qeffdt
      AND a.anbr=a_ed.anbr)
      AND a.type=$2
    `, [userAnswers.email, userAnswers.type]);

    return respUserAnswers.rows;
  }

  async checkAnswerQuestion(answerQuestionDto: AnswerQuestionDto) {
    const answerQuestion = await this.clientPg.query(`
      SELECT SUBSTRING(b.hide, $1) answer FROM ag_user_quest a, ag_entans b
      WHERE a.email=$2
      AND a.effdt=(SELECT MAX(a_ed.effdt) FROM ag_user_quest a_ed WHERE a.email=a_ed.email AND a.type=a_ed.type AND a.qnbr=a_ed.qnbr AND a.qeffdt=a_ed.qeffdt
      AND a.anbr=a_ed.anbr)
      AND a.qnbr=b.qnbr AND a.qeffdt=b.effdt AND a.anbr=b.anbr
      AND a.qnbr=$3 AND a.type=$4
    `, [answerQuestionDto.numbers, answerQuestionDto.email, answerQuestionDto.question, answerQuestionDto.type]);

    return answerQuestion.rows[0];
  }

  async saveUserQuestion() {
    const userQuest = await this.clientPg.query(`
      SELECT email FROM ag_user_quest WHERE email=$1 AND qnbr=$2 AND qeffdt=$3
    `, []);

    if (userQuest.rows.length > 0) {
      await this.clientPg.query(`
        UPDATE ag_user_quest SET anbr=$1, effdt=$2, extravalue=$3
      `, []);
    }
  }
}
