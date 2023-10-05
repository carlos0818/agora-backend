import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { RowDataPacket } from 'mysql2/promise';

import { UserAnswers } from './dto/userAnswers.dto';
import { SaveQuestionDto } from './dto/saveQuestion.dto';
import { DeleteUserQuestionDto } from './dto/deleteUserQuestion.dto';
import { SaveQuestionWithNoValidation } from './dto/saveQuestionWithoutValidation.dto';
import { SubmitQuestionnaire } from './dto/submitQuestionnaire.dto';
import { ValidateQuestionnaireByEmailDto } from './dto/validateQuestionnaireByEmail.dto';
import { ValidateQuestionnaireByIdDto } from './dto/validateQuestionnaireById.dto';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpService: HttpService,
  ){}

  async listQuestionsEntrepreneur(getQuestionsDto: GetQuestionsDto) {
    const conn = await this.databaseService.getConnection();

    const questions = await conn.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_entquest q left outer join ag_entquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang=?
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `, [getQuestionsDto.lang]);

    await this.databaseService.closeConnection(conn);

    return questions[0];
  }

  async listQuestionsInvestor(getQuestionsDto: GetQuestionsDto) {
    const conn = await this.databaseService.getConnection();

    const questions = await conn.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_invquest q left outer join ag_invquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang=?
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_invquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `, [getQuestionsDto.lang]);

    await this.databaseService.closeConnection(conn);

    return questions[0];
  }

  async listQuestionsExpert(getQuestionsDto: GetQuestionsDto) {
    const conn = await this.databaseService.getConnection();

    const questions = await conn.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_expquest q left outer join ag_expquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang=?
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_expquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `, [getQuestionsDto.lang]);

    await this.databaseService.closeConnection(conn);

    return questions[0];
  }

  async listAnswersEntrepreneur() {
    const conn = await this.databaseService.getConnection();

    const answers = await conn.query<RowDataPacket[]>(`
      SELECT qnbr, DATE_FORMAT(effdt, '%Y-%m-%d %H:%i:%s') effdt, anbr, status, score, descr, \`show\`, hide FROM ag_entans a WHERE a.status='A'
      AND a.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entans q_ed WHERE a.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY a.orderby
    `);

    await this.databaseService.closeConnection(conn);

    return answers[0];
  }

  async listAnswersInvestor() {
    const conn = await this.databaseService.getConnection();

    const answers = await conn.query<RowDataPacket[]>(`
      SELECT qnbr, DATE_FORMAT(effdt, '%Y-%m-%d %H:%i:%s') effdt, anbr, status, score, descr, \`show\`, hide FROM ag_invans a WHERE a.status='A'
      AND a.effdt=(SELECT MAX(q_ed.effdt) FROM ag_invans q_ed WHERE a.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY a.orderby
    `);

    await this.databaseService.closeConnection(conn);

    return answers[0];
  }

  async listAnswersExpert() {
    const conn = await this.databaseService.getConnection();

    const answers = await conn.query<RowDataPacket[]>(`
      SELECT qnbr, DATE_FORMAT(effdt, '%Y-%m-%d %H:%i:%s') effdt, anbr, status, score, descr, \`show\`, hide FROM ag_expans a WHERE a.status='A'
      AND a.effdt=(SELECT MAX(q_ed.effdt) FROM ag_expans q_ed WHERE a.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY a.orderby
    `);

    await this.databaseService.closeConnection(conn);

    return answers[0];
  }

  async userAnswers(userAnswers: UserAnswers) {
    const conn = await this.databaseService.getConnection();

    const respUserAnswers = await conn.query<RowDataPacket[]>(`
      SELECT a.qnbr, a.anbr, extravalue FROM ag_user_quest a
      WHERE a.email=?
      AND a.qeffdt=(SELECT MAX(a_ed.qeffdt) FROM ag_user_quest a_ed WHERE a.email=a_ed.email AND a.qnbr=a_ed.qnbr AND a.qeffdt=a_ed.qeffdt
      AND a.anbr=a_ed.anbr);
    `, [userAnswers.email]);

    await this.databaseService.closeConnection(conn);

    return respUserAnswers[0];
  }

  async getUserQuestionVersion(email: string) {
    const conn = await this.databaseService.getConnection();

    const maxVersion = await conn.query<RowDataPacket[]>(`
      SELECT CASE WHEN MAX(qversion) IS NULL THEN 1 ELSE MAX(qversion) + 1 END AS maxVersion FROM ag_user_form_version WHERE email=?
    `, [email]);

    await this.databaseService.closeConnection(conn);

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

    const conn = await this.databaseService.getConnection();

    const userQuest = await conn.query<RowDataPacket[]>(query, [maxVersion, saveQuestionDto.effdt, saveQuestionDto.email, saveQuestionDto.qnbr]);

    if (userQuest[0].length > 0) {
      await conn.query(`
        UPDATE ag_user_quest SET anbr=?, extravalue=? WHERE email=? AND qnbr=? AND qeffdt=? AND qversion=?
      `, [saveQuestionDto.anbr, saveQuestionDto.extravalue, saveQuestionDto.email, saveQuestionDto.qnbr, saveQuestionDto.effdt, maxVersion]);
    } else {
      if (saveQuestionDto.extravalue) {
        await conn.query(`
          INSERT INTO ag_user_quest VALUES(?,?,?,?,?,?)
        `, [saveQuestionDto.email, saveQuestionDto.qnbr, saveQuestionDto.effdt, saveQuestionDto.anbr, maxVersion, saveQuestionDto.extravalue]);
      } else {
        await conn.query(`
          INSERT INTO ag_user_quest(email, qnbr, qeffdt, anbr, qversion) VALUES(?,?,?,?,?)
        `, [saveQuestionDto.email, saveQuestionDto.qnbr, saveQuestionDto.effdt, saveQuestionDto.anbr, maxVersion]);
      }
    }

    const respAnswers = await conn.query(query2, [saveQuestionDto.qnbr, saveQuestionDto.anbr]);
    const hide = respAnswers[0][0].hide

    await conn.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qnbr > ?
      AND qnbr IN (${ hide })
    `, [saveQuestionDto.email, saveQuestionDto.qnbr]);

    await this.databaseService.closeConnection(conn);
  }

  async deleteUserQuestion(deleteUserQuestion: DeleteUserQuestionDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qnbr=? AND anbr=? AND qeffdt=? AND qversion=?
    `, [deleteUserQuestion.email, deleteUserQuestion.qnbr, deleteUserQuestion.anbr, deleteUserQuestion.qeffdt, deleteUserQuestion.qversion]);

    await this.databaseService.closeConnection(conn);
  }

  async saveQuestionWithNoValidation(saveQuestionWithNoValidation: SaveQuestionWithNoValidation) {
    const conn = await this.databaseService.getConnection();

    if (!saveQuestionWithNoValidation.extravalue) {
      await conn.query(`
        INSERT INTO ag_user_quest VALUES(?, ?, ?, ?, ?, NULL)
      `, [saveQuestionWithNoValidation.email, saveQuestionWithNoValidation.qnbr, saveQuestionWithNoValidation.qeffdt, saveQuestionWithNoValidation.anbr, saveQuestionWithNoValidation.qversion]);
    } else {
      await conn.query(`
        INSERT INTO ag_user_quest VALUES(?, ?, ?, ?, ?, ?)
      `, [saveQuestionWithNoValidation.email, saveQuestionWithNoValidation.qnbr, saveQuestionWithNoValidation.qeffdt, saveQuestionWithNoValidation.anbr, saveQuestionWithNoValidation.qversion, saveQuestionWithNoValidation.extravalue]);
    }

    await this.databaseService.closeConnection(conn);
  }

  async submitQuestionnaireEntrepreneur(submitQuestionnaire: SubmitQuestionnaire) {
    const conn = await this.databaseService.getConnection();

    const respQversion = await conn.query<RowDataPacket[]>(`
      SELECT qversion + 1 qversion FROM ag_user WHERE email=?
    `, [submitQuestionnaire.email]);
    const qversion = respQversion[0][0].qversion;

    const respQuestionsNotInTemplate = await conn.query<RowDataPacket[]>(`
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
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException('Please complete the questionnaire');
    }

    questionsNotInTemplate.map(async (question: any) => {
      if (!question.delete_is_null) {
        await conn.query(`
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=? AND qnbr <> 0
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await conn.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_entans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hideArr: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await conn.query<RowDataPacket[]>(`
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

    await conn.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString }) AND qnbr <> 0
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await conn.query<RowDataPacket[]>(`
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
        await this.databaseService.closeConnection(conn);
        throw new BadRequestException('Please complete the questionnaire');
      }
    }

    await conn.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

    await conn.query(`
      INSERT INTO ag_user_form_version VALUES(?,?,NOW())
    `, [submitQuestionnaire.email, qversion]);

    await this.databaseService.closeConnection(conn);

    await this.generateAboutUsEntrepreneur(submitQuestionnaire.email);

    return { message: 'Questionnaire saved' };
  }

  async submitQuestionnaireInvestor(submitQuestionnaire: SubmitQuestionnaire) {
    const conn = await this.databaseService.getConnection();

    const respQversion = await conn.query<RowDataPacket[]>(`
      SELECT qversion + 1 qversion FROM ag_user WHERE email=?
    `, [submitQuestionnaire.email]);
    const qversion = respQversion[0][0].qversion;

    const respQuestionsNotInTemplate = await conn.query<RowDataPacket[]>(`
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
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException('Please complete the questionnaire');
    }

    questionsNotInTemplate.map(async (question: any) => {
      if (!question.delete_is_null) {
        await conn.query(`
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=? AND qnbr <> 0
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await conn.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_invans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hideArr: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await conn.query<RowDataPacket[]>(`
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

    await conn.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString }) AND qnbr <> 0
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await conn.query<RowDataPacket[]>(`
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
        await this.databaseService.closeConnection(conn);
        throw new BadRequestException('Please complete the questionnaire' + hideString);
      }
    }

    await conn.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

    await conn.query(`
      INSERT INTO ag_user_form_version VALUES(?,?,NOW())
    `, [submitQuestionnaire.email, qversion]);

    await this.databaseService.closeConnection(conn);

    await this.generateAboutUsInvestor(submitQuestionnaire.email);

    return { message: 'Questionnaire saved' };
  }

  async submitQuestionnaireExpert(submitQuestionnaire: SubmitQuestionnaire) {
    const conn = await this.databaseService.getConnection();

    const respQversion = await conn.query<RowDataPacket[]>(`
      SELECT qversion + 1 qversion FROM ag_user WHERE email=?
    `, [submitQuestionnaire.email]);
    const qversion = respQversion[0][0].qversion;

    const respQuestionsNotInTemplate = await conn.query<RowDataPacket[]>(`
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
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException('Please complete the questionnaire');
    }

    questionsNotInTemplate.map(async (question: any) => {
      if (!question.delete_is_null) {
        await conn.query(`
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=? AND qnbr <> 0
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await conn.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_expans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hideArr: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await conn.query<RowDataPacket[]>(`
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

    await conn.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString }) AND qnbr <> 0
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await conn.query<RowDataPacket[]>(`
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
        await this.databaseService.closeConnection(conn);
        throw new BadRequestException('Please complete the questionnaire');
      }
    }

    await conn.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

    await conn.query(`
      INSERT INTO ag_user_form_version VALUES(?,?,NOW())
    `, [submitQuestionnaire.email, qversion]);

    await this.databaseService.closeConnection(conn);

    await this.generateAboutUsExpert(submitQuestionnaire.email);

    return { message: 'Questionnaire saved' };
  }

  async validateCompleteQuestionnaireByEmail(validateQuestionnaireByEmailDto: ValidateQuestionnaireByEmailDto) {
    const conn = await this.databaseService.getConnection();

    const respValidate = await conn.query(`
      SELECT 'RESPONSE' FROM ag_user WHERE email=? AND qversion=(SELECT MAX(qversion) FROM ag_user_quest WHERE email=?)
    `, [validateQuestionnaireByEmailDto.email, validateQuestionnaireByEmailDto.email]);
    const validate = Object.assign([], respValidate[0]);

    await this.databaseService.closeConnection(conn);

    if (validate.length > 0) {
      throw new BadRequestException('The questionnaire has already been completed');
    }

    return { message: 'Ok' };
  }

  async validateCompleteQuestionnaireById(validateQuestionnaireByIdDto: ValidateQuestionnaireByIdDto) {
    const conn = await this.databaseService.getConnection();

    const respUser = await conn.query<RowDataPacket[]>(`
      SELECT id, email, fullname, type FROM ag_user WHERE id=?
    `, [validateQuestionnaireByIdDto.id]);

    if (respUser[0].length === 0) {
      await this.databaseService.closeConnection(conn);
      return { response: 0, message: 'The user does not exist' };
    }

    const respValidate = await conn.query(`
      SELECT 'RESPONSE' FROM ag_user WHERE id=? AND qversion=(SELECT MAX(qversion) FROM ag_user_quest WHERE id=?)
    `, [validateQuestionnaireByIdDto.id, validateQuestionnaireByIdDto.id]);
    const validate = Object.assign([], respValidate[0]);

    await this.databaseService.closeConnection(conn);

    if (validate.length > 0) {
      return { response: '1', data: respUser[0][0], message: 'The questionnaire has already been completed' };
    }

    return { response: '0', data: respUser[0][0], message: 'Error' };
  }

  private async generateAboutUsEntrepreneur(email: string) {
    let conn = await this.databaseService.getConnection();

    const dataResp = await conn.query<RowDataPacket[]>(`
      select Q.qnbr, concat(group_concat(
        case 
        when Q.qnbr=2 then Q.extravalue 
        when Q.qnbr=1 then (select C.name from ag_country C where C.id=convert(Q.extravalue,unsigned))
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

    await this.databaseService.closeConnection(conn);

    let content = '';

    const find1 = dataResp[0].find(data => data.qnbr === '1');
    const find2 = dataResp[0].find(data => data.qnbr === '2');
    const find3 = dataResp[0].find(data => data.qnbr === '3');
    const find5 = dataResp[0].find(data => data.qnbr === '5');
    const find6 = dataResp[0].find(data => data.qnbr === '6');
    const find37 = dataResp[0].find(data => data.qnbr === '37');
    const find38 = dataResp[0].find(data => data.qnbr === '38');
    const findCO = dataResp[0].find(data => data.qnbr === 'CO');

    if (findCO && find3 && find6 && find2 && find1 && find5) {
      content += `${ findCO.R3 } is an ${ find3.R3 } operating in the ${ find6.R3 } area which was incorporated in ${ find2.R3 } in ${ find1.R3 } as a ${ find5.R3 }.`;
    }
    if (findCO && find37) {
      content += `Compared to its competitors ${ findCO.R3 } distiguish itself for its ${ find37.R3 } uniquely position the company in the market, setting it apart from both existing and emerging competitors.`;
    }
    if (find38) {
      content += `Considering our competitive landscape, we observe, ${ find38.R3 } and this undoubtedly influences the direction of our business operations.`;
    }

    const contentSystem = 'As an expert in Engineering Economics and marketing techniques, your role involves leveraging advanced data analysis tools to present business ventures to potential investors. Your mission is to craft compelling narratives that vividly illustrate the immense potential of these ventures, enabling companies to stand out in a competitive landscape. To captivate investor interest, emphasize key aspects such as scalability, market demand, and revenue projections for each endeavor. Extract valuable insights from market trends, customer behaviors, and competitive benchmarks. Craft a compelling story firmly rooted in data-backed insights, all while maintaining a tone that is both professional and approachable. Please respond in English, using a text-based narrative format, and ensure your response remains within 2000 characters. Avoid using letter-style or slider-based formats.';

    const { maxIndex, aboutUs } = await this.gpt(email, contentSystem, content);

    conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_entrepreneur SET aboutus=?, gptindex=? WHERE email=?
    `, [aboutUs, maxIndex, email]);

    await this.databaseService.closeConnection(conn);
  }

  private async generateAboutUsExpert(email: string) {
    let conn = await this.databaseService.getConnection();

    const dataResp = await conn.query<RowDataPacket[]>(`
      select 
      case
      when UQ.qnbr=5 then 'Relevant Areas of Expertise '
      else Q.descr
      end as descr,  
      case 
      when R.descr = '%NUMBER%' then UQ.extravalue
      when UQ.qnbr=5 then concat(Q.descr, ': ', R.descr)
      else R.descr
      end as output
      from ag_user U, ag_user_quest UQ, ag_expquest Q, ag_expans R
      where 
      U.email=?
      and U.status=1
      and UQ.email=U.email
      and UQ.qversion=U.qversion
      and Q.qnbr=UQ.qnbr
      and Q.effdt=UQ.qeffdt
      and UQ.qnbr <> 0
      and R.qnbr=UQ.qnbr
      and R.effdt=UQ.qeffdt
      and R.anbr=UQ.anbr
    `, [email]);

    await this.databaseService.closeConnection(conn);

    let content = 'Analyze the data from the form containing questions and answers provided by expert consultants in entrepreneurship. This data holds utmost importance in facilitating informed decisions. Your task is to succinctly summarize this information within a maximum of 2000 characters. Ensure that your summary encompasses key details regarding the consultants\' experience, skills, recommendations, and any other pertinent information vital for evaluating their suitability for entrepreneurial projects. Present your summary in a promotional narrative that appeals to the entrepreneur, encouraging them to consider the consulting services offered by the analyzed company. Please provide your response in a plain text narrative format, avoiding any letter or slider format.';

    for (let i=0; i<dataResp[0].length; i++) {
      if (i<dataResp[0].length - 1)
        content += `${ dataResp[0][i].descr }, ${ dataResp[0][i].output }; `;
      else
        content += `${ dataResp[0][i].descr }, ${ dataResp[0][i].output }.`;
    }

    const contentSystem = 'Imagine yourself as a proficient marketing expert, deeply dedicated to enhancing business success. Your mission is to craft a compelling narrative to promote the consultant or consulting firm chosen by an intelligent and ambitious entrepreneur to elevate their venture. Maintain a professional tone with a touch of warmth while staying within 2000 characters. Please respond in plain text, avoiding any letter or slider format.';

    const { maxIndex, aboutUs } = await this.gpt(email, contentSystem, content);

    conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_expert SET aboutus=?, gptindex=? WHERE email=?
    `, [aboutUs, maxIndex, email]);

    await this.databaseService.closeConnection(conn);
  }

  async generateAboutUsInvestor(email: string) {
    let conn = await this.databaseService.getConnection();

    const dataResp = await conn.query<RowDataPacket[]>(`
      select UQ.qnbr, 
      case 
      when UQ.qnbr in (1,10) then UQ.extravalue 
      else R.descr end as ans
      from ag_user U, ag_user_quest UQ, ag_invans R
      where U.email=?
      and U.status=1
      and UQ.email=U.email
      and UQ.qversion=U.qversion
      and UQ.qnbr <> 0
      and R.status='A'
      and R.qnbr=UQ.qnbr
      and R.effdt=UQ.qeffdt
      and UQ.anbr=R.anbr
      union
      select 0, name from ag_investor where email=?
    `, [email, email]);

    await this.databaseService.closeConnection(conn);

    let content = 'The final result should present a promotional framework from a marketing perspective, designed to inspire the entrepreneur to choose the right investor for their brand.';

    const find0 = dataResp[0].find(data => data.qnbr === 0);
    const find1 = dataResp[0].find(data => data.qnbr === 1);
    const find2 = dataResp[0].find(data => data.qnbr === 2);
    const find3 = dataResp[0].filter(data => data.qnbr === 3);
    const ans3 = find3.map(find => (find.ans));
    const find4 = dataResp[0].find(data => data.qnbr === 4);
    const find6 = dataResp[0].find(data => data.qnbr === 6);
    const find7 = dataResp[0].find(data => data.qnbr === 7);
    const find8 = dataResp[0].find(data => data.qnbr === 8);
    const find9 = dataResp[0].find(data => data.qnbr === 9);
    const find10 = dataResp[0].find(data => data.qnbr === 10);
    const find11 = dataResp[0].filter(data => data.qnbr === 11);
    const ans11 = find11.map(find => (find.ans));
    const find12 = dataResp[0].find(data => data.qnbr === 12);
    const find13 = dataResp[0].find(data => data.qnbr === 13);
    const find16 = dataResp[0].find(data => data.qnbr === 16);
    const find17 = dataResp[0].find(data => data.qnbr === 17);
    const find18 = dataResp[0].find(data => data.qnbr === 18);
    const find19 = dataResp[0].find(data => data.qnbr === 19);
    const find21 = dataResp[0].find(data => data.qnbr === 21);
    const find23 = dataResp[0].find(data => data.qnbr === 23);

    if (find0 && find1) {
      content += `My investment company is called ${ find0.ans } and was founded in the year ${ find1.ans }.`;
    }

    content += 'I lead a proactive group of workers focused on finding the best investment.';

    if (find0 && find2) {
      content += `The legal status of ${ find0.ans } is ${ find2.ans }.`;
    }

    if (find0 && find3) {
      content += `${ find0.ans } is looking for activity areas like: ${ ans3.join(', ') }.`;
    }

    if (find0 && find4) {
      if (find4.ans.toLowerCase() === 'yes') {
        content += `${ find0.ans } is engadget with the SDGs.`;
      }
    }

    if (find6) {
      content += `The investment priorities for us are: ${ find6.ans }.`;
    }

    if (find7) {
      content += `We have a ${ find7.ans } risk preference.`;
    }

    if (find8) {
      content += `Our type of investment offered is ${ find8.ans }.`;
    }

    if (find9) {
      content += `Our invesment maturity is ${ find9.ans }.`;
    }

    if (find10) {
      content += `Our investment currency is ${ find10.ans }.`;
    }

    if (find11) {
      content += `We are interested to invest in the following countries: ${ ans11.join(', ') }.`;
    }

    if (find12) {
      content += `We are planning to invest in ${ find12.ans } enterprises.`;
    }

    if (find13) {
      content += `Our investment portfolio size is ${ find13.ans } USD.`;
    }

    if (find16) {
      if (find16.ans.toLowerCase() === 'yes') {
        content += `We have the tools to analyse SMEs in emerging countries.`;
      }
    }

    if (find17) {
      if (find17.ans.toLowerCase() === 'yes') {
        content += `We have already invested in emerging countries.`;
      }
    }

    if (find18) {
      if (find18.ans.toLowerCase() === 'yes') {
        content += `We will use the UNCDF SMEs analysis to make our investment decisions.`;
      }
    }

    if (find19) {
      if (find19.ans.toLowerCase() !== 'n/a') {
        content += `We are offering ${ find19.ans } lending for our entrepreneurs.`;
      }
    }

    if (find21) {
      if (find21.ans.toLowerCase() === 'yes') {
        content += `We do have risk sharing facilities arrangement in place.`;
      }
    }

    if (find23) {
      content += `The maximum loss we can support in one year considering an investment in a SME is ${ find23.ans }.`;
    }

    const contentSystem = 'Imagine yourself as a marketing expert tasked with promoting an investment firm searching for profitable entrepreneurial opportunities. Your objective is to craft a professional yet approachable narrative. Please respond in English, using a textual narrative format, and limit your response to 2000 characters. Avoid using letter-style or slider-based formats.';

    const { maxIndex, aboutUs } = await this.gpt(email, contentSystem, content);

    conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_investor SET aboutus=?, gptindex=? WHERE email=?
    `, [aboutUs, maxIndex, email]);

    await this.databaseService.closeConnection(conn);
  }

  private async gpt(email: string, contentSystem: string, contentUser: string) {
    const { data } = await lastValueFrom(this.httpService.post(`https://servicesai.agora-sme.org/pitch-deck`, {
      contentSystem,
      contentUser
    }));

    const aboutUs = data.data.choices[0].message.content;
    const prompt_tokens = data.data.usage.prompt_tokens;
    const completion_tokens = data.data.usage.completion_tokens;
    const total_tokens = data.data.usage.total_tokens;

    const conn = await this.databaseService.getConnection();

    await conn.query(`
      INSERT INTO ag_gpttokens VALUES(NULL,?,?,?,?,NOW(),'pitchdeck')
    `, [email, prompt_tokens, completion_tokens, total_tokens]);

    const maxIndexResp = await conn.query('SELECT MAX(`index`) maxIndex FROM ag_gpttokens');
    const maxIndex = maxIndexResp[0][0].maxIndex;

    await this.databaseService.closeConnection(conn);

    return { maxIndex, aboutUs };
  }
}
