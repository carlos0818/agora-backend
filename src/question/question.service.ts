import { Inject, Injectable } from '@nestjs/common';

import { Client } from 'pg';

import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
  ){}

  async listQuestions() {
    const questions = await this.clientPg.query<Question>(`
      SELECT qnbr, effdt, descr, video, type, object, bobject, page FROM ag_entquest WHERE status='A' ORDER BY page, orderby
    `);

    let rows = questions.rows;

    let correlative = 1;
    for (let i=0; i<rows.length; i++) {
      if (rows[i].type === 'Q') {
        rows[i].correlative = correlative;
        correlative ++;
      }
    }

    return rows;
  }

  async listAnswers() {
    const questions = await this.clientPg.query<Answer>(`
      SELECT * FROM ag_entans WHERE status='A' ORDER BY orderby
    `);

    return questions.rows;
  }
}
