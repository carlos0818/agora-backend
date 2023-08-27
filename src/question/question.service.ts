import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { Pool, RowDataPacket } from 'mysql2/promise';

import { UserAnswers } from './dto/userAnswers.dto';
import { SaveQuestionDto } from './dto/saveQuestion.dto';
import { DeleteUserQuestionDto } from './dto/deleteUserQuestion.dto';
import { SaveQuestionWithNoValidation } from './dto/saveQuestionWithoutValidation.dto';
import { SubmitQuestionnaire } from './dto/submitQuestionnaire.dto';
import { ValidateQuestionnaireByEmailDto } from './dto/validateQuestionnaireByEmail.dto';
import { ValidateQuestionnaireByIdDto } from './dto/validateQuestionnaireById.dto';
import { GetQuestionsDto } from './dto/get-questions.dto';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly pool: Pool,
    private readonly httpService: HttpService,
  ){}

  async listQuestionsEntrepreneur(getQuestionsDto: GetQuestionsDto) {
    const questions = await this.pool.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_entquest q left outer join ag_entquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang=?
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `, [getQuestionsDto.lang]);

    return questions[0];
  }

  async listQuestionsInvestor(getQuestionsDto: GetQuestionsDto) {
    const questions = await this.pool.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_invquest q left outer join ag_invquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang=?
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_invquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `, [getQuestionsDto.lang]);

    return questions[0];
  }

  async listQuestionsExpert(getQuestionsDto: GetQuestionsDto) {
    const questions = await this.pool.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_expquest q left outer join ag_expquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang=?
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_expquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `, [getQuestionsDto.lang]);

    return questions[0];
  }

  async listAnswersEntrepreneur() {
    const answers = await this.pool.query<RowDataPacket[]>(`
      SELECT qnbr, DATE_FORMAT(effdt, '%Y-%m-%d %H:%i:%s') effdt, anbr, status, score, descr, \`show\`, hide FROM ag_entans a WHERE a.status='A'
      AND a.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entans q_ed WHERE a.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY a.orderby
    `);

    return answers[0];
  }

  async listAnswersInvestor() {
    const answers = await this.pool.query<RowDataPacket[]>(`
      SELECT qnbr, DATE_FORMAT(effdt, '%Y-%m-%d %H:%i:%s') effdt, anbr, status, score, descr, \`show\`, hide FROM ag_invans a WHERE a.status='A'
      AND a.effdt=(SELECT MAX(q_ed.effdt) FROM ag_invans q_ed WHERE a.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY a.orderby
    `);

    return answers[0];
  }

  async listAnswersExpert() {
    const answers = await this.pool.query<RowDataPacket[]>(`
      SELECT qnbr, DATE_FORMAT(effdt, '%Y-%m-%d %H:%i:%s') effdt, anbr, status, score, descr, \`show\`, hide FROM ag_expans a WHERE a.status='A'
      AND a.effdt=(SELECT MAX(q_ed.effdt) FROM ag_expans q_ed WHERE a.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY a.orderby
    `);

    return answers[0];
  }

  async userAnswers(userAnswers: UserAnswers) {
    const respUserAnswers = await this.pool.query<RowDataPacket[]>(`
      SELECT a.qnbr, a.anbr, extravalue FROM ag_user_quest a
      WHERE a.email=?
      AND a.qeffdt=(SELECT MAX(a_ed.qeffdt) FROM ag_user_quest a_ed WHERE a.email=a_ed.email AND a.qnbr=a_ed.qnbr AND a.qeffdt=a_ed.qeffdt
      AND a.anbr=a_ed.anbr);
    `, [userAnswers.email]);

    return respUserAnswers[0];
  }

  async getUserQuestionVersion(email: string) {
    const maxVersion = await this.pool.query<RowDataPacket[]>(`
      SELECT CASE WHEN MAX(qversion) IS NULL THEN 1 ELSE MAX(qversion) + 1 END AS maxVersion FROM ag_user_form_version WHERE email=?
    `, [email]);

    return maxVersion[0][0].maxVersion;
  }

  async saveUserQuestion(saveQuestionDto: SaveQuestionDto) {
    const maxVersion = await this.getUserQuestionVersion(saveQuestionDto.email)

    let query = '';
    let query2 = '';

    if (saveQuestionDto.type === 'E') {
      query = `SELECT 'EXISTS' FROM ag_user_quest a, ag_entans b
              WHERE qversion = ?
              AND b.qnbr=a.qnbr AND b.effdt=a.qeffdt AND b.anbr=a.anbr
              AND b.effdt = ?
              AND a.email = ?
              AND a.qnbr = ?`;
      query2 = `SELECT hide FROM ag_entans WHERE qnbr=? AND anbr=?`;
    } else if (saveQuestionDto.type === 'I') {
      query = `SELECT 'EXISTS' FROM ag_user_quest a, ag_invans b
              WHERE qversion = ?
              AND b.qnbr=a.qnbr AND b.effdt=a.qeffdt AND b.anbr=a.anbr
              AND b.effdt = ?
              AND a.email = ?
              AND a.qnbr = ?`;
      query2 = `SELECT hide FROM ag_invans WHERE qnbr=? AND anbr=?`;
    } else {
      query = `SELECT 'EXISTS' FROM ag_user_quest a, ag_expans b
              WHERE qversion = ?
              AND b.qnbr=a.qnbr AND b.effdt=a.qeffdt AND b.anbr=a.anbr
              AND b.effdt = ?
              AND a.email = ?
              AND a.qnbr = ?`;
      query2 = `SELECT hide FROM ag_expans WHERE qnbr=? AND anbr=?`;
    }

    const userQuest = await this.pool.query<RowDataPacket[]>(query, [maxVersion, saveQuestionDto.effdt, saveQuestionDto.email, saveQuestionDto.qnbr]);

    if (userQuest[0].length > 0) {
      await this.pool.query(`
        UPDATE ag_user_quest SET anbr=?, extravalue=? WHERE email=? AND qnbr=? AND qeffdt=? AND qversion=?
      `, [saveQuestionDto.anbr, saveQuestionDto.extravalue, saveQuestionDto.email, saveQuestionDto.qnbr, saveQuestionDto.effdt, maxVersion]);
    } else {
      if (saveQuestionDto.extravalue) {
        await this.pool.query(`
          INSERT INTO ag_user_quest VALUES(?,?,?,?,?,?)
        `, [saveQuestionDto.email, saveQuestionDto.qnbr, saveQuestionDto.effdt, saveQuestionDto.anbr, maxVersion, saveQuestionDto.extravalue]);
      } else {
        await this.pool.query(`
          INSERT INTO ag_user_quest(email, qnbr, qeffdt, anbr, qversion) VALUES(?,?,?,?,?)
        `, [saveQuestionDto.email, saveQuestionDto.qnbr, saveQuestionDto.effdt, saveQuestionDto.anbr, maxVersion]);
      }
    }

    const respAnswers = await this.pool.query(query2, [saveQuestionDto.qnbr, saveQuestionDto.anbr]);
    const hide = respAnswers[0][0].hide

    await this.pool.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qnbr > ?
      AND qnbr IN (${ hide })
    `, [saveQuestionDto.email, saveQuestionDto.qnbr]);
  }

  async deleteUserQuestion(deleteUserQuestion: DeleteUserQuestionDto) {
    await this.pool.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qnbr=? AND anbr=? AND qeffdt=? AND qversion=?
    `, [deleteUserQuestion.email, deleteUserQuestion.qnbr, deleteUserQuestion.anbr, deleteUserQuestion.qeffdt, deleteUserQuestion.qversion]);
  }

  async saveQuestionWithNoValidation(saveQuestionWithNoValidation: SaveQuestionWithNoValidation) {
    if (!saveQuestionWithNoValidation.extravalue) {
      await this.pool.query(`
        INSERT INTO ag_user_quest VALUES(?, ?, ?, ?, ?, NULL)
      `, [saveQuestionWithNoValidation.email, saveQuestionWithNoValidation.qnbr, saveQuestionWithNoValidation.qeffdt, saveQuestionWithNoValidation.anbr, saveQuestionWithNoValidation.qversion]);
    } else {
      await this.pool.query(`
        INSERT INTO ag_user_quest VALUES(?, ?, ?, ?, ?, ?)
      `, [saveQuestionWithNoValidation.email, saveQuestionWithNoValidation.qnbr, saveQuestionWithNoValidation.qeffdt, saveQuestionWithNoValidation.anbr, saveQuestionWithNoValidation.qversion, saveQuestionWithNoValidation.extravalue]);
    }
  }

  async submitQuestionnaireEntrepreneur(submitQuestionnaire: SubmitQuestionnaire) {
    const respQversion = await this.pool.query<RowDataPacket[]>(`
      SELECT qversion + 1 qversion FROM ag_user WHERE email=?
    `, [submitQuestionnaire.email]);
    const qversion = respQversion[0][0].qversion;

    const respQuestionsNotInTemplate = await this.pool.query<RowDataPacket[]>(`
      SELECT UQTOTAL.qnbr, UQTOTAL.qeffdt, UQTOTAL.anbr, UQ.anbr AS delete_is_null FROM ag_user_quest UQTOTAL LEFT OUTER JOIN ag_user_quest UQ ON 
      UQ.email=? AND UQ.qversion=?
      AND UQ.QEFFDT = (SELECT MAX(EFFDT) FROM ag_entquest ED WHERE ED.QNBR=UQ.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND UQ.ANBR = (SELECT ANS.ANBR FROM ag_entans ANS WHERE ANS.QNBR=UQ.QNBR AND ANS.EFFDT=UQ.QEFFDT AND ANS.ANBR=UQ.ANBR AND ANS.STATUS='A')
      AND UQ.qnbr=UQTOTAL.qnbr AND UQ.anbr=UQTOTAL.anbr
      WHERE UQTOTAL.email=? AND UQTOTAL.qversion=?
      ORDER BY QNBR
    `, [submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion]);
    const questionsNotInTemplate = Object.assign([], respQuestionsNotInTemplate[0]);

    if (questionsNotInTemplate.length === 0) {
      throw new BadRequestException('Please complete the questionnaire');
    }

    questionsNotInTemplate.map(async (question: any) => {
      if (!question.delete_is_null) {
        await this.pool.query(`
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=? AND qnbr <> 0
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await this.pool.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_entans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hideArr: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await this.pool.query<RowDataPacket[]>(`
        SELECT \`show\`, \`hide\` FROM ag_entans WHERE qnbr=? AND effdt=? AND anbr=?
      `, [userAnswersWithAction[i].qnbr, userAnswersWithAction[i].qeffdt, userAnswersWithAction[i].anbr]);
      const showHide = respShowHide[0][0];

      const respShowSplit = showHide.show?.split(',') || null
      const respHideSplit = showHide.hide?.split(',') || null

      if (respShowSplit) {
          if (respShowSplit.length > 0) {
              for (let k=0; k<respShowSplit.length; k++) {
                  const showSplit = respShowSplit[k]
                  for(let l=0; l<hideArr.length; l++) {
                      const hide = hideArr[l]
                      if (showSplit === hide) {
                          hideArr.splice(l, 1)
                      }
                  }
              }
          }
      }

      if (respHideSplit) {
          if(respHideSplit.length > 0) {
              for (let k=0; k<respHideSplit.length; k++) {
                  const hideSplit = respHideSplit[k]
                  let flag = false
                  for (let l=0; l<hideArr.length; l++) {
                      const hide = hideArr[l]
                      if (hideSplit === hide) {
                          flag = true
                      }
                  }

                  if (!flag) {
                      hideArr.push(hideSplit)
                  }
              }
          }
      }
    }
    
    let hideString = hideArr.join(',');

    await this.pool.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString }) AND qnbr <> 0
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await this.pool.query<RowDataPacket[]>(`
      SELECT A.QNBR, CASE WHEN UQ.QNBR IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_entans A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND email=? AND qversion=?
      WHERE
      A.EFFDT = (SELECT MAX(EFFDT) FROM ag_entquest ED WHERE ED.QNBR=A.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND A.ANBR = (SELECT ANS.ANBR FROM ag_entans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A')
      AND A.QNBR NOT IN (${ hideString })
      AND A.QNBR IN (SELECT QNBR FROM ag_entquest WHERE object IN ('C','Y','F','L','T','A') AND TYPE='Q')
      GROUP BY A.QNBR
      UNION
      SELECT A.QNBR, CASE WHEN COUNT(UQ.ANBR) BETWEEN substring_index(A.bobject,',',1) AND substring_index(A.bobject,',',-1) THEN 'E' ELSE 'NE' END AS \`EXISTS\` FROM ag_entquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
      WHERE object='M'
      AND type = 'Q'
      AND A.QNBR NOT IN (${ hideString })
      GROUP BY A.QNBR, A.BOBJECT
      UNION
      SELECT A.QNBR, CASE WHEN UQ.EXTRAVALUE IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_entquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
      WHERE object='B'
      AND type = 'Q'
      AND A.QNBR NOT IN (${ hideString })
      GROUP BY A.QNBR
    `, [submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion]);
    const missingAnswers = Object.assign([{}], respMissingAnswers[0]);

    for (let i=0; i<missingAnswers.length; i++) {
      if (missingAnswers[i].EXISTS === 'NE') {
        console.log('2');
        throw new BadRequestException('Please complete the questionnaire');
      }
    }

    await this.pool.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

    await this.pool.query(`
      INSERT INTO ag_user_form_version VALUES(?,?,NOW())
    `, [submitQuestionnaire.email, qversion]);

    await this.generateAboutUsEntrepreneur(submitQuestionnaire.email);

    return { message: 'Questionnaire saved' };
  }

  async submitQuestionnaireInvestor(submitQuestionnaire: SubmitQuestionnaire) {
    const respQversion = await this.pool.query<RowDataPacket[]>(`
      SELECT qversion + 1 qversion FROM ag_user WHERE email=?
    `, [submitQuestionnaire.email]);
    const qversion = respQversion[0][0].qversion;

    const respQuestionsNotInTemplate = await this.pool.query<RowDataPacket[]>(`
      SELECT UQTOTAL.qnbr, UQTOTAL.qeffdt, UQTOTAL.anbr, UQ.anbr AS delete_is_null FROM ag_user_quest UQTOTAL LEFT OUTER JOIN ag_user_quest UQ ON 
      UQ.email=? AND UQ.qversion=?
      AND UQ.QEFFDT = (SELECT MAX(EFFDT) FROM ag_invquest ED WHERE ED.QNBR=UQ.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND UQ.ANBR = (SELECT ANS.ANBR FROM ag_invans ANS WHERE ANS.QNBR=UQ.QNBR AND ANS.EFFDT=UQ.QEFFDT AND ANS.ANBR=UQ.ANBR AND ANS.STATUS='A')
      AND UQ.qnbr=UQTOTAL.qnbr AND UQ.anbr=UQTOTAL.anbr
      WHERE UQTOTAL.email=? AND UQTOTAL.qversion=?
      ORDER BY QNBR
    `, [submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion]);
    const questionsNotInTemplate = Object.assign([], respQuestionsNotInTemplate[0]);

    if (questionsNotInTemplate.length === 0) {
      throw new BadRequestException('Please complete the questionnaire');
    }

    questionsNotInTemplate.map(async (question: any) => {
      if (!question.delete_is_null) {
        await this.pool.query(`
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=? AND qnbr <> 0
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await this.pool.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_invans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hideArr: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await this.pool.query<RowDataPacket[]>(`
        SELECT \`show\`, \`hide\` FROM ag_invans WHERE qnbr=? AND effdt=? AND anbr=?
      `, [userAnswersWithAction[i].qnbr, userAnswersWithAction[i].qeffdt, userAnswersWithAction[i].anbr]);
      const showHide = respShowHide[0][0];
  
      const respShowSplit = showHide.show?.split(',') || null
      const respHideSplit = showHide.hide?.split(',') || null

      if (respShowSplit) {
          if (respShowSplit.length > 0) {
              for (let k=0; k<respShowSplit.length; k++) {
                  const showSplit = respShowSplit[k]
                  for(let l=0; l<hideArr.length; l++) {
                      const hide = hideArr[l]
                      if (showSplit === hide) {
                          hideArr.splice(l, 1)
                      }
                  }
              }
          }
      }

      if (respHideSplit) {
          if(respHideSplit.length > 0) {
              for (let k=0; k<respHideSplit.length; k++) {
                  const hideSplit = respHideSplit[k]
                  let flag = false
                  for (let l=0; l<hideArr.length; l++) {
                      const hide = hideArr[l]
                      if (hideSplit === hide) {
                          flag = true
                      }
                  }

                  if (!flag) {
                      hideArr.push(hideSplit)
                  }
              }
          }
      }
    }
    
    let hideString = hideArr.join(',');

    await this.pool.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString }) AND qnbr <> 0
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await this.pool.query<RowDataPacket[]>(`
      SELECT A.QNBR, CASE WHEN UQ.QNBR IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_invans A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND email=? AND qversion=?
      WHERE
      A.EFFDT = (SELECT MAX(EFFDT) FROM ag_invquest ED WHERE ED.QNBR=A.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND A.ANBR = (SELECT ANS.ANBR FROM ag_invans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A')
      AND A.QNBR NOT IN (${ hideString })
      AND A.QNBR IN (SELECT QNBR FROM ag_invquest WHERE object IN ('C','Y','F','L','T','A') AND TYPE='Q')
      GROUP BY A.QNBR
      UNION
      SELECT A.QNBR, CASE WHEN COUNT(UQ.ANBR) BETWEEN substring_index(A.bobject,',',1) AND substring_index(A.bobject,',',-1) THEN 'E' ELSE 'NE' END AS \`EXISTS\` FROM ag_invquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
      WHERE object='M'
      AND type = 'Q'
      AND A.QNBR NOT IN (${ hideString })
      GROUP BY A.QNBR, A.BOBJECT
      UNION
      SELECT A.QNBR, CASE WHEN UQ.EXTRAVALUE IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_invquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
      WHERE object='B'
      AND type = 'Q'
      AND A.QNBR NOT IN (${ hideString })
      GROUP BY A.QNBR
    `, [submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion]);
    const missingAnswers = Object.assign([{}], respMissingAnswers[0]);

    for (let i=0; i<missingAnswers.length; i++) {
      if (missingAnswers[i].EXISTS === 'NE') {
        throw new BadRequestException('Please complete the questionnaire' + hideString);
      }
    }

    await this.pool.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

    await this.pool.query(`
      INSERT INTO ag_user_form_version VALUES(?,?,NOW())
    `, [submitQuestionnaire.email, qversion]);

    return { message: 'Questionnaire saved' };
  }

  async submitQuestionnaireExpert(submitQuestionnaire: SubmitQuestionnaire) {
    const respQversion = await this.pool.query<RowDataPacket[]>(`
      SELECT qversion + 1 qversion FROM ag_user WHERE email=?
    `, [submitQuestionnaire.email]);
    const qversion = respQversion[0][0].qversion;

    const respQuestionsNotInTemplate = await this.pool.query<RowDataPacket[]>(`
      SELECT UQTOTAL.qnbr, UQTOTAL.qeffdt, UQTOTAL.anbr, UQ.anbr AS delete_is_null FROM ag_user_quest UQTOTAL LEFT OUTER JOIN ag_user_quest UQ ON 
      UQ.email=? AND UQ.qversion=?
      AND UQ.QEFFDT = (SELECT MAX(EFFDT) FROM ag_expquest ED WHERE ED.QNBR=UQ.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND UQ.ANBR = (SELECT ANS.ANBR FROM ag_expans ANS WHERE ANS.QNBR=UQ.QNBR AND ANS.EFFDT=UQ.QEFFDT AND ANS.ANBR=UQ.ANBR AND ANS.STATUS='A')
      AND UQ.qnbr=UQTOTAL.qnbr AND UQ.anbr=UQTOTAL.anbr
      WHERE UQTOTAL.email=? AND UQTOTAL.qversion=?
      ORDER BY QNBR
    `, [submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion]);
    const questionsNotInTemplate = Object.assign([], respQuestionsNotInTemplate[0]);

    if (questionsNotInTemplate.length === 0) {
      throw new BadRequestException('Please complete the questionnaire');
    }

    questionsNotInTemplate.map(async (question: any) => {
      if (!question.delete_is_null) {
        await this.pool.query(`
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=? AND qnbr <> 0
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await this.pool.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_expans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hideArr: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await this.pool.query<RowDataPacket[]>(`
        SELECT \`show\`, \`hide\` FROM ag_expans WHERE qnbr=? AND effdt=? AND anbr=?
      `, [userAnswersWithAction[i].qnbr, userAnswersWithAction[i].qeffdt, userAnswersWithAction[i].anbr]);
      const showHide = respShowHide[0][0];
  
      const respShowSplit = showHide.show?.split(',') || null
      const respHideSplit = showHide.hide?.split(',') || null

      if (respShowSplit) {
          if (respShowSplit.length > 0) {
              for (let k=0; k<respShowSplit.length; k++) {
                  const showSplit = respShowSplit[k]
                  for(let l=0; l<hideArr.length; l++) {
                      const hide = hideArr[l]
                      if (showSplit === hide) {
                          hideArr.splice(l, 1)
                      }
                  }
              }
          }
      }

      if (respHideSplit) {
          if(respHideSplit.length > 0) {
              for (let k=0; k<respHideSplit.length; k++) {
                  const hideSplit = respHideSplit[k]
                  let flag = false
                  for (let l=0; l<hideArr.length; l++) {
                      const hide = hideArr[l]
                      if (hideSplit === hide) {
                          flag = true
                      }
                  }

                  if (!flag) {
                      hideArr.push(hideSplit)
                  }
              }
          }
      }
    }
    
    let hideString = hideArr.join(',');

    await this.pool.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString }) AND qnbr <> 0
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await this.pool.query<RowDataPacket[]>(`
      SELECT A.QNBR, CASE WHEN UQ.QNBR IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_expans A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND email=? AND qversion=?
      WHERE
      A.EFFDT = (SELECT MAX(EFFDT) FROM ag_expquest ED WHERE ED.QNBR=A.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND A.ANBR = (SELECT ANS.ANBR FROM ag_expans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A')
      AND A.QNBR NOT IN (${ hideString })
      AND A.QNBR IN (SELECT QNBR FROM ag_expquest WHERE object IN ('C','Y','F','L','T','A') AND TYPE='Q')
      GROUP BY A.QNBR
      UNION
      SELECT A.QNBR, CASE WHEN COUNT(UQ.ANBR) BETWEEN substring_index(A.bobject,',',1) AND substring_index(A.bobject,',',-1) THEN 'E' ELSE 'NE' END AS \`EXISTS\` FROM ag_expquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
      WHERE object='M'
      AND type = 'Q'
      AND A.QNBR NOT IN (${ hideString })
      GROUP BY A.QNBR, A.BOBJECT
      UNION
      SELECT A.QNBR, CASE WHEN UQ.EXTRAVALUE IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_expquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
      WHERE object='B'
      AND type = 'Q'
      AND A.QNBR NOT IN (${ hideString })
      GROUP BY A.QNBR
    `, [submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion, submitQuestionnaire.email, qversion]);
    const missingAnswers = Object.assign([{}], respMissingAnswers[0]);

    for (let i=0; i<missingAnswers.length; i++) {
      if (missingAnswers[i].EXISTS === 'NE') {
        throw new BadRequestException('Please complete the questionnaire');
      }
    }

    await this.pool.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

    await this.pool.query(`
      INSERT INTO ag_user_form_version VALUES(?,?,NOW())
    `, [submitQuestionnaire.email, qversion]);

    return { message: 'Questionnaire saved' };
  }

  async validateCompleteQuestionnaireByEmail(validateQuestionnaireByEmailDto: ValidateQuestionnaireByEmailDto) {
    const respValidate = await this.pool.query(`
      SELECT 'RESPONSE' FROM ag_user WHERE email=? AND qversion=(SELECT MAX(qversion) FROM ag_user_quest WHERE email=?)
    `, [validateQuestionnaireByEmailDto.email, validateQuestionnaireByEmailDto.email]);
    const validate = Object.assign([], respValidate[0]);

    if (validate.length > 0) {
      throw new BadRequestException('The questionnaire has already been completed');
    }

    return { message: 'Ok' };
  }

  async validateCompleteQuestionnaireById(validateQuestionnaireByIdDto: ValidateQuestionnaireByIdDto) {
    const respUser = await this.pool.query<RowDataPacket[]>(`
      SELECT id, email, fullname, type FROM ag_user WHERE id=?
    `, [validateQuestionnaireByIdDto.id]);

    if (respUser[0].length === 0) {
      return { response: 0, message: 'The user does not exist' };
    }

    const respValidate = await this.pool.query(`
      SELECT 'RESPONSE' FROM ag_user WHERE id=? AND qversion=(SELECT MAX(qversion) FROM ag_user_quest WHERE id=?)
    `, [validateQuestionnaireByIdDto.id, validateQuestionnaireByIdDto.id]);
    const validate = Object.assign([], respValidate[0]);

    if (validate.length > 0) {
      return { response: '1', data: respUser[0][0], message: 'The questionnaire has already been completed' };
    }

    return { response: '0', data: respUser[0][0], message: 'Error' };
  }

  private async generateAboutUsEntrepreneur(email: string) {
    const dataResp = await this.pool.query<RowDataPacket[]>(`
      select Q.qnbr, concat(group_concat(
        case 
        when Q.qnbr=2 then Q.extravalue 
        when Q.qnbr=1 then Q.extravalue 
          else A1.descr 
      end 
        SEPARATOR ', ')) 
      as R3 from ag_user U, ag_user_quest Q, ag_entans A1
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (3,6,2,1,5,37,38)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        group by Q.qnbr
      UNION
      select 'CO', name from ag_entrepreneur where email=?
    `, [email, email]);

    let content = '';

    const find1 = dataResp[0].find(data => data.qnbr === '1');
    const find2 = dataResp[0].find(data => data.qnbr === '2');
    const find3 = dataResp[0].find(data => data.qnbr === '3');
    const find5 = dataResp[0].find(data => data.qnbr === '5');
    const find6 = dataResp[0].find(data => data.qnbr === '6');
    const find37 = dataResp[0].find(data => data.qnbr === '37');
    const find38 = dataResp[0].find(data => data.qnbr === '38');
    const findCO = dataResp[0].find(data => data.qnbr === 'CO');
    if (find1) {
      content += ``;
    }
    if (find2) {
      content += ``;
    }
    if (find3) {
      content += ``;
    }
    if (find5) {
      content += ``;
    }
    if (find6) {
      content += ``;
    }
    if (find37) {
      content += ``;
    }
    if (find38) {
      content += ``;
    }
    if (findCO) {
      content += ``;
    }

    // const resp1 = dataResp[0][0].R3;
    // const resp2 = dataResp[0][1].R3;
    // const resp3 = dataResp[0][2].R3;
    // const resp5 = dataResp[0][3].R3;
    // const resp6 = dataResp[0][4].R3;
    // const resp37 = dataResp[0][5].R3;
    // const resp38 = dataResp[0][6].R3;
    // const respCO = dataResp[0][7].R3;
    // // const content = `${ respCO } is an ${ resp3 } operating in the ${ resp6 } area which was incorporated in ${ resp2 } in ${ resp1 } as a ${ resp5 }. Compared to its competitors ${ respCO } distiguish itself for its ${ resp37 } uniquely position the company in the market, setting it apart from both existing and emerging competitors. Considering our competitive landscape, we observe, ${ resp38 } and this undoubtedly influences the direction of our business operations.`;

    // const { data } = await lastValueFrom(this.httpService.post(`https://servicesai.agora-sme.org/pitch-deck`, {
    //   content
    // }));

    // const aboutUs = data.data.choices[0].message.content;

    // await this.pool.query(`
    //   UPDATE ag_entrepreneur SET aboutus=? WHERE email=?
    // `, [aboutUs, email]);
  }
}
