import { Injectable } from '@nestjs/common';

import { InjectClient } from 'nest-mysql';
import { Connection, RowDataPacket } from 'mysql2/promise';

import { UserAnswers } from './dto/userAnswers.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectClient() private readonly connection: Connection,
  ){}

  async listQuestions() {
    const questions = await this.connection.query<RowDataPacket[]>(`
      SELECT qnbr, effdt, descr, video, type, object, bobject, page FROM ag_entquest q
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `);

    return questions[0];
  }

  async listAnswers() {
    const answers = await this.connection.query<RowDataPacket[]>(`
      SELECT qnbr, effdt, anbr, status, score, descr, 'show', hide FROM ag_entans a WHERE a.status='A'
      AND a.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entans q_ed WHERE a.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY a.orderby
    `);

    return answers[0];
  }

  async userAnswers(userAnswers: UserAnswers) {
    const respUserAnswers = await this.connection.query<RowDataPacket[]>(`
      SELECT a.qnbr, a.anbr FROM ag_user_quest a
      WHERE a.email=?
      AND a.effdt=(SELECT MAX(a_ed.effdt) FROM ag_user_quest a_ed WHERE a.email=a_ed.email AND a.type=a_ed.type AND a.qnbr=a_ed.qnbr AND a.qeffdt=a_ed.qeffdt
      AND a.anbr=a_ed.anbr)
      AND a.type=?
    `, [userAnswers.email, userAnswers.type]);

    return respUserAnswers[0];
  }

  // async checkAnswerQuestion(answerQuestionDto: AnswerQuestionDto) {
  //   const answerQuestion = await this.connection.query(`
  //     SELECT SUBSTRING(b.hide, $1) answer FROM ag_user_quest a, ag_entans b
  //     WHERE a.email=$2
  //     AND a.effdt=(SELECT MAX(a_ed.effdt) FROM ag_user_quest a_ed WHERE a.email=a_ed.email AND a.type=a_ed.type AND a.qnbr=a_ed.qnbr AND a.qeffdt=a_ed.qeffdt
  //     AND a.anbr=a_ed.anbr)
  //     AND a.qnbr=b.qnbr AND a.qeffdt=b.effdt AND a.anbr=b.anbr
  //     AND a.qnbr=$3 AND a.type=$4
  //   `, [answerQuestionDto.numbers, answerQuestionDto.email, answerQuestionDto.question, answerQuestionDto.type]);

  //   return answerQuestion.rows[0];
  // }

  // DEBO ENVIAR EL anbr Y EL extravalue por el endpoint
  async saveUserQuestion() {
    const maxVersion = await this.connection.query<RowDataPacket[]>(`
      SELECT CASE WHEN MAX(qversion) IS NULL THEN 1 ELSE MAX(qversion) + 1 END AS FROM ag_user_form_version WHERE email=?
    `);
    
    const userQuest = await this.connection.query<RowDataPacket[]>(`
      SELECT a.email, a.qnbr, a.qeffdt FROM ag_user_quest a, ag_entans b
      WHERE qversion = ${ maxVersion[0][0].maxVersion }
      AND b.qnbr=a.qnbr and b.effdt=a.qeffdt and b.anbr=a.anbr and b.status='A'
      AND b.effdt = (select max(b_ed.effdt) from ag_entans b_ed where b.qnbr=b_ed.qnbr and b_ed.effdt <= sysdate())
      AND a.email = ?
      AND a.qnbr = ?
    `, []);

    if (userQuest[0].length > 0) {
      await this.connection.query(`
        UPDATE ag_user_quest SET anbr=? WHERE email=? AND qnbr=? AND qeffdt=? AND qversion=?
      `, []);
    } else {
      await this.connection.query(`
        INSERT INTO ag_user_quest VALUES(?,?,?,?,?,?)
      `, [userQuest[0][0].email, userQuest[0][0].qnbr, userQuest[0][0].qeffdt, userQuest[0][0].qversion]);
    }
  }
}
