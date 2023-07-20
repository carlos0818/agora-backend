import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { Pool, RowDataPacket } from 'mysql2/promise';

import { UserAnswers } from './dto/userAnswers.dto';
import { SaveQuestionDto } from './dto/saveQuestion.dto';
import { DeleteUserQuestionDto } from './dto/deleteUserQuestion.dto';
import { SaveQuestionWithNoValidation } from './dto/saveQuestionWithoutValidation.dto';
import { SubmitQuestionnaire } from './dto/submitQuestionnaire.dto';
import { UserQuestion } from './entities/user-question.entity';
import { ValidateQuestionnaireByEmailDto } from './dto/validateQuestionnaireByEmail.dto';
import { ValidateQuestionnaireByIdDto } from './dto/validateQuestionnaireById.dto';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly pool: Pool,
  ){}

  async listQuestionsEntrepreneur() {
    const questions = await this.pool.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_entquest q left outer join ag_entquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang='EN'
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `);

    return questions[0];
  }

  async listQuestionsInvestor() {
    const questions = await this.pool.query<RowDataPacket[]>(`
      SELECT q.qnbr, DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt, q.descr, v.video, q.type, q.object, q.bobject, q.page
      FROM ag_invquest q left outer join ag_invquest_video v on q.qnbr=v.qnbr and q.effdt=v.effdt and v.lang='EN'
      WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_invquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
      ORDER BY q.page, q.orderby
    `);

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

    const userQuest = await this.pool.query<RowDataPacket[]>(`
      SELECT 'EXISTS' FROM ag_user_quest a, ag_entans b
      WHERE qversion = ?
      AND b.qnbr=a.qnbr AND b.effdt=a.qeffdt AND b.anbr=a.anbr
      AND b.effdt = ?
      AND a.email = ?
      AND a.qnbr = ?
    `, [maxVersion, saveQuestionDto.effdt, saveQuestionDto.email, saveQuestionDto.qnbr]);

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
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=?
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await this.pool.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_entans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hide: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await this.pool.query<RowDataPacket[]>(`
        SELECT \`show\`, \`hide\` FROM ag_entans WHERE qnbr=? AND effdt=? AND anbr=?
      `, [userAnswersWithAction[i].qnbr, userAnswersWithAction[i].qeffdt, userAnswersWithAction[i].anbr]);
      const showHide = respShowHide[0][0];
  
      let respHideSplit: any;
  
      if (showHide.hide?.substring(0, 4) !== 'qnbr') {
        respHideSplit = showHide.hide?.split(',') || null;
      }
  
      if(respHideSplit) {
        hide.push(...respHideSplit);
      }
    }
    
    let hideString = hide.join(',');

    await this.pool.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString })
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await this.pool.query<RowDataPacket[]>(`
      SELECT A.QNBR, CASE WHEN UQ.QNBR IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_entans A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND email=? AND qversion=?
      WHERE
      A.EFFDT = (SELECT MAX(EFFDT) FROM ag_entquest ED WHERE ED.QNBR=A.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND A.ANBR = (SELECT ANS.ANBR FROM ag_entans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A')
      AND A.QNBR NOT IN (${ hideString })
      AND A.QNBR IN (SELECT QNBR FROM ag_entquest WHERE object IN ('C','Y','F','L') AND TYPE='Q')
      GROUP BY A.QNBR
      UNION
      SELECT A.QNBR, CASE WHEN COUNT(UQ.ANBR) BETWEEN SUBSTR(A.BOBJECT,1,1) AND SUBSTR(A.BOBJECT,3,1) THEN 'E' ELSE 'NE' END AS \`EXISTS\` FROM ag_entquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
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
        throw new BadRequestException('Please complete the questionnaire');
      }
    }

    await this.pool.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

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
          DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr=? AND anbr=?
        `, [submitQuestionnaire.email, qversion, question.qnbr, question.anbr]);
      }
    });

    const respUserAnswersWithAction = await this.pool.query<RowDataPacket[]>(`
      SELECT uq.qnbr, uq.qeffdt, uq.anbr FROM ag_user_quest uq, ag_invans e WHERE uq.qnbr=e.qnbr AND uq.anbr=e.anbr AND uq.qeffdt=e.effdt
      AND uq.email=? AND uq.qversion=? AND e.status='A' AND e.hide IS NOT NULL
    `, [submitQuestionnaire.email, qversion]);
    const userAnswersWithAction = Object.assign([{}], respUserAnswersWithAction[0]);

    let hide: string[] = [];

    for (let i=0; i<userAnswersWithAction.length; i++) {
      const respShowHide = await this.pool.query<RowDataPacket[]>(`
        SELECT \`show\`, \`hide\` FROM ag_entans WHERE qnbr=? AND effdt=? AND anbr=?
      `, [userAnswersWithAction[i].qnbr, userAnswersWithAction[i].qeffdt, userAnswersWithAction[i].anbr]);
      const showHide = respShowHide[0][0];
  
      let respHideSplit: any;
  
      if (showHide.hide?.substring(0, 4) !== 'qnbr') {
        respHideSplit = showHide.hide?.split(',') || null;
      }
  
      if(respHideSplit) {
        hide.push(...respHideSplit);
      }
    }
    
    let hideString = hide.join(',');

    await this.pool.query(`
      DELETE FROM ag_user_quest WHERE email=? AND qversion=? AND qnbr IN(${ hideString })
    `, [submitQuestionnaire.email, qversion]);

    const respMissingAnswers = await this.pool.query<RowDataPacket[]>(`
      SELECT A.QNBR, CASE WHEN UQ.QNBR IS NULL THEN 'NE' ELSE 'E' END AS \`EXISTS\` FROM ag_invans A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND email=? AND qversion=?
      WHERE
      A.EFFDT = (SELECT MAX(EFFDT) FROM ag_invquest ED WHERE ED.QNBR=A.QNBR AND ED.STATUS='A' AND ED.EFFDT <= sysdate())
      AND A.ANBR = (SELECT ANS.ANBR FROM ag_invans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A')
      AND A.QNBR NOT IN (${ hideString })
      AND A.QNBR IN (SELECT QNBR FROM ag_invquest WHERE object IN ('C','Y','F','L') AND TYPE='Q')
      GROUP BY A.QNBR
      UNION
      SELECT A.QNBR, CASE WHEN COUNT(UQ.ANBR) BETWEEN SUBSTR(A.BOBJECT,1,1) AND SUBSTR(A.BOBJECT,3,1) THEN 'E' ELSE 'NE' END AS \`EXISTS\` FROM ag_invquest A LEFT OUTER JOIN ag_user_quest UQ ON UQ.QNBR=A.QNBR AND UQ.QEFFDT=A.EFFDT AND email=? AND qversion=?
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
        throw new BadRequestException('Please complete the questionnaire');
      }
    }

    await this.pool.query(`
      UPDATE ag_user SET qversion=qversion+1 WHERE email=?
    `, [submitQuestionnaire.email]);

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
    const respEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [validateQuestionnaireByIdDto.id]);

    if (respEmail[0].length === 0) {
      throw new BadRequestException('The user does not exist');
    }

    const email = respEmail[0][0].email;

    const respValidate = await this.pool.query(`
      SELECT 'RESPONSE' FROM ag_user WHERE id=? AND qversion=(SELECT MAX(qversion) FROM ag_user_quest WHERE id=?)
    `, [email, email]);
    const validate = Object.assign([], respValidate[0]);

    if (validate.length > 0) {
      throw new BadRequestException('The questionnaire has already been completed');
    }

    return { message: 'Ok' };
  }
}
