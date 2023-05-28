import { Inject, Injectable } from '@nestjs/common';

import { Client } from 'pg';

import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
  ){}

  async listQuestions() {
    const questions = await this.clientPg.query<Question>(`
      SELECT * FROM ag_entquest ORDER BY orderby
    `);

    return questions.rows;
  }

  async listAnswers() {
    const questions = await this.clientPg.query<Question>(`
      SELECT * FROM ag_entans ORDER BY orderby
    `);

    return questions.rows;
  }
}
