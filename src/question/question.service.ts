import { Inject, Injectable } from '@nestjs/common';

import { Client } from 'pg';

import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
  ){}

  async listQuestions() {
    const questions = await this.clientPg.query(`
      SELECT qnbr, effdt, descr, video, type, object, bobject FROM ag_entquest ORDER BY orderby
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
    const questions = await this.clientPg.query<Question>(`
      SELECT * FROM ag_entans ORDER BY orderby
    `);

    return questions.rows;
  }
}
