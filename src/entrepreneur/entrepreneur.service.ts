import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RowDataPacket } from 'mysql2/promise';

import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { UpdateEntrepreneurInfoDto } from './dto/update-entrepreneur-info';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneur.dto';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { SearchDto } from './dto/search.dto';
import { ShowNotificationDto } from './dto/show-notification.dto';
import { DatabaseService } from 'src/database/database.service';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class EntrepreneurService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ){}

  async getDataByEmail(updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    const conn = await this.databaseService.getConnection();

    const data = await conn.query(`
      SELECT
      name, email_contact, phone, country, city, address, profilepic, backpic, videourl, videodesc, aboutus, web, facebook, linkedin, twitter, DATE_FORMAT(creationdate, '%b %Y') since
      FROM ag_entrepreneur e, ag_user u WHERE u.email=e.email AND e.email=?
    `, [updateEntrepreneurInfoDto.email]);

    await this.databaseService.closeConnection(conn);

    return data[0][0];
  }

  async getDataById(getDataByIdDto: GetDataByIdDto) {
    const conn = await this.databaseService.getConnection();

    const respEmail = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);

    const data = await conn.query(`
      SELECT
      name, email_contact, phone, country, city, address, profilepic, backpic, videourl, videodesc, aboutus, web, facebook, linkedin, twitter, DATE_FORMAT(creationdate, '%b %Y') since
      FROM ag_user u LEFT OUTER JOIN ag_entrepreneur e ON(u.email=e.email) WHERE u.email=?
    `, [respEmail[0][0].email]);

    await this.databaseService.closeConnection(conn);

    return data[0][0];
  }

  async updateEntrepreneurInfo(updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    const conn = await this.databaseService.getConnection();

    const respValidateEmail = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=?
    `, [updateEntrepreneurInfoDto.email]);
    const validateEmail = respValidateEmail[0];

    if (validateEmail.length === 0) {
      throw new BadRequestException('The email not found');
    }

    const respVerify = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_entrepreneur WHERE email=?
    `, [updateEntrepreneurInfoDto.email]);
    const verify = respVerify[0];

    let query = 'UPDATE ag_entrepreneur SET ';
    let field = '';
    let data = '';

    if (updateEntrepreneurInfoDto.name) {
      query += 'name=?';
      field = 'name';
      data = updateEntrepreneurInfoDto.name !== '' ? updateEntrepreneurInfoDto.name : null;
    } else if (updateEntrepreneurInfoDto.email_contact) {
      query += 'email_contact=?';
      field = 'email_contact';
      data = updateEntrepreneurInfoDto.email_contact !== '' ? updateEntrepreneurInfoDto.email_contact : null;
    } else if (updateEntrepreneurInfoDto.phone) {
      query += 'phone=?';
      field = 'phone';
      data = updateEntrepreneurInfoDto.phone !== '' ? updateEntrepreneurInfoDto.phone : null;
    } else if (updateEntrepreneurInfoDto.country) {
      query += 'country=?';
      field = 'country';
      data = updateEntrepreneurInfoDto.country !== '' ? updateEntrepreneurInfoDto.country : null;
    } else if (updateEntrepreneurInfoDto.city) {
      query += 'city=?';
      field = 'city';
      data = updateEntrepreneurInfoDto.city !== '' ? updateEntrepreneurInfoDto.city : null;
    } else if (updateEntrepreneurInfoDto.address) {
      query += 'address=?';
      field = 'address';
      data = updateEntrepreneurInfoDto.address !== '' ? updateEntrepreneurInfoDto.address : null;
    } else if (updateEntrepreneurInfoDto.profilepic) {
      query += 'profilepic=?';
      field = 'profilepic';
      data = updateEntrepreneurInfoDto.profilepic !== '' ? updateEntrepreneurInfoDto.profilepic : null;
    } else if (updateEntrepreneurInfoDto.backpic) {
      query += 'backpic=?';
      field = 'backpic';
      data = updateEntrepreneurInfoDto.backpic !== '' ? updateEntrepreneurInfoDto.backpic : null;
    } else if (updateEntrepreneurInfoDto.videourl) {
      query += 'videourl=?';
      field = 'videourl';
      data = updateEntrepreneurInfoDto.videourl !== '' ? updateEntrepreneurInfoDto.videourl : null;
    } else if (updateEntrepreneurInfoDto.web) {
      query += 'web=?';
      field = 'web';
      data = updateEntrepreneurInfoDto.web !== '' ? updateEntrepreneurInfoDto.web : null;
    } else if (updateEntrepreneurInfoDto.facebook) {
      query += 'facebook=?';
      field = 'facebook';
      data = updateEntrepreneurInfoDto.facebook !== '' ? updateEntrepreneurInfoDto.facebook : null;
    } else if (updateEntrepreneurInfoDto.linkedin) {
      query += 'linkedin=?';
      field = 'linkedin';
      data = updateEntrepreneurInfoDto.linkedin !== '' ? updateEntrepreneurInfoDto.linkedin : null;
    } else if (updateEntrepreneurInfoDto.twitter) {
      query += 'twitter=?';
      field = 'twitter';
      data = updateEntrepreneurInfoDto.twitter !== '' ? updateEntrepreneurInfoDto.twitter : null;
    } else if (updateEntrepreneurInfoDto.aboutus) {
      query += 'aboutus=?';
      field = 'aboutus';
      data = updateEntrepreneurInfoDto.aboutus !== '' ? updateEntrepreneurInfoDto.aboutus : null;
    } else if (updateEntrepreneurInfoDto.videodesc) {
      query += 'videodesc=?';
      field = 'videodesc';
      data = updateEntrepreneurInfoDto.videodesc !== '' ? updateEntrepreneurInfoDto.videodesc : null;
    }

    query += ' WHERE email=?';

    if (verify.length === 0 && data.length > 0) {
      query = `INSERT INTO ag_entrepreneur(${ field }, email) VALUES(?,?)`;
    }

    if (data.length > 0) {
      await conn.query<RowDataPacket[]>(query, [data, updateEntrepreneurInfoDto.email]);
    }

    await this.databaseService.closeConnection(conn);

    return {
      message: 'Entrepreneur saved'
    }
  }

  async update(updateEntrepreneurDto: UpdateEntrepreneurDto) {
    let query = 'UPDATE ag_entrepreneur SET name=?, email_contact=?, phone=?, country=?, city=?, address=?, ';
    let params = [
      updateEntrepreneurDto.name,
      updateEntrepreneurDto.email_contact,
      updateEntrepreneurDto.phone,
      updateEntrepreneurDto.country,
      updateEntrepreneurDto.city,
      updateEntrepreneurDto.address
    ];

    if(updateEntrepreneurDto.profilepic) {
      query += 'profilepic=?, ';
      params.push(updateEntrepreneurDto.profilepic);
    }

    if(updateEntrepreneurDto.backpic) {
      query += 'backpic=?, ';
      params.push(updateEntrepreneurDto.backpic);
    }

    if(updateEntrepreneurDto.videourl) {
      query += 'videourl=?, ';
      params.push(updateEntrepreneurDto.videourl);
    }

    query += 'web=?, facebook=?, linkedin=?, twitter=? WHERE email=?';
    params.push(updateEntrepreneurDto.web);
    params.push(updateEntrepreneurDto.facebook);
    params.push(updateEntrepreneurDto.linkedin);
    params.push(updateEntrepreneurDto.twitter);
    params.push(updateEntrepreneurDto.email);

    const conn = await this.databaseService.getConnection();

    await conn.query(query, params);

    await this.databaseService.closeConnection(conn);

    return {
      message: 'Entrepreneur saved'
    }
  }

  async validateRequiredData(getDataByIdDto: GetDataByIdDto, token: string) {
    const decoded = this.jwtService.decode(token) as JwtPayload;
    if (!decoded) {
      throw new UnauthorizedException('');
    }

    const conn = await this.databaseService.getConnection();

    const respEmail = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);
    const email = respEmail[0][0].email;


    if (decoded.email === email) {
      await this.databaseService.closeConnection(conn);
      return { response: 1 }
    }

    const respValidate = await conn.query<RowDataPacket[]>(`
      SELECT COUNT(email) response FROM ag_entrepreneur
      WHERE name IS NOT NULL AND email_contact IS NOT NULL AND phone IS NOT NULL AND country IS NOT NULL AND city IS NOT NULL AND address IS NOT NULL
      AND profilepic IS NOT NULL AND email=?
    `, [email]);

    await this.databaseService.closeConnection(conn);

    if (respValidate[0][0].response === 0) {
      throw new BadRequestException('Required data is not completed');
    }

    return respValidate[0][0];
  }

  async getCompanySize() {
    const conn = await this.databaseService.getConnection();

    const types = await conn.query(`
      SELECT anbr, descr FROM ag_entans A WHERE A.QNBR=4 AND A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_entans ANS
      WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      ORDER BY orderby
    `);

    await this.databaseService.closeConnection(conn);

    return types[0];
  }

  async search(searchDto: SearchDto) {
    let query = `
      select U.id, E.profilepic, E.name, U.email, E.country, A2.descr as front1, A.descr as front2, UQ3.extravalue as back1, A4.descr as back2, A5.descr as back3 from ag_user U, ag_user_quest UQ, ag_entans A, ag_user_quest UQ2, ag_entans A2, ag_user_quest UQ3, ag_user_quest UQ4, ag_entans A4, ag_user_quest UQ5, ag_entans A5, ag_entrepreneur E
      WHERE
      E.email=UQ.email
      and U.email=UQ.email
      and U.qversion=UQ.qversion
      and UQ.qnbr=A.qnbr
      and UQ.qeffdt=A.effdt
      and UQ.anbr=A.anbr
      and A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_entans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      and UQ.qnbr=4
      and U.email=UQ2.email
      and U.qversion=UQ2.qversion
      and UQ2.qnbr=A2.qnbr
      and UQ2.qeffdt=A2.effdt
      and UQ2.anbr=A2.anbr
      and A2.EFFDT= (SELECT MAX(ANS2.EFFDT) FROM ag_entans ANS2 WHERE ANS2.QNBR=A2.QNBR AND ANS2.EFFDT=A2.EFFDT AND ANS2.ANBR=A2.ANBR AND ANS2.STATUS='A' AND ANS2.EFFDT <= SYSDATE())
      and UQ2.qnbr=6
      and U.email=UQ3.email
      and U.qversion=UQ3.qversion
      and UQ3.qnbr=144
      and U.email=UQ4.email
      and U.qversion=UQ4.qversion
      and UQ4.qnbr=A4.qnbr
      and UQ4.qeffdt=A4.effdt
      and UQ4.anbr=A4.anbr
      and A4.EFFDT= (SELECT MAX(ANS4.EFFDT) FROM ag_entans ANS4 WHERE ANS4.QNBR=A4.QNBR AND ANS4.EFFDT=A4.EFFDT AND ANS4.ANBR=A4.ANBR AND ANS4.STATUS='A' AND ANS4.EFFDT <= SYSDATE())
      and UQ4.qnbr=145
      and U.email=UQ5.email
      and U.qversion=UQ5.qversion
      and UQ5.qnbr=A5.qnbr
      and UQ5.qeffdt=A5.effdt
      and UQ5.anbr=A5.anbr
      and A5.EFFDT= (SELECT MAX(ANS5.EFFDT) FROM ag_entans ANS5 WHERE ANS5.QNBR=A5.QNBR AND ANS5.EFFDT=A5.EFFDT AND ANS5.ANBR=A5.ANBR AND ANS5.STATUS='A' AND ANS5.EFFDT <= SYSDATE())
      and UQ5.qnbr=142
    `;
    let parameters = [];

    if (searchDto.term && searchDto.term !== '') {
      query += ` AND E.name LIKE ?`;
      parameters.push(`%${ searchDto.term }%`);
    }

    if (searchDto.country && searchDto.country !== '') {
      query += ` AND E.country = ?`;
      parameters.push(searchDto.country);
    }

    if (searchDto.from && searchDto.to && searchDto.from !== '' && searchDto.to !== '') {
      query += ` AND CAST(REPLACE(UQ3.extravalue,',','') AS DECIMAL) BETWEEN ? AND ?`;
      parameters.push(Number(searchDto.from));
      parameters.push(Number(searchDto.to));
    }

    if (searchDto.anbr && searchDto.anbr !== '') {
      query += ` AND A.anbr = ?`;
      parameters.push(searchDto.anbr);
    }

    if (searchDto.alphabetical && searchDto.alphabetical !== '' && searchDto.funding && searchDto.funding !== '') {
      query += ` ORDER BY name, back1`;
    } else if (searchDto.alphabetical && searchDto.alphabetical !== '') {
      query += ` ORDER BY name`;
    } else if (searchDto.funding && searchDto.funding !== '') {
      query += ` ORDER BY back1`;
    }

    const conn = await this.databaseService.getConnection();

    const searchResult = await conn.query<RowDataPacket[]>(query, parameters);

    const contactsResp = await conn.query<RowDataPacket[]>(`
      select distinct * from 
      (
      select distinct email from ag_contact where emailcontact=?
      union
      select distinct emailcontact from ag_contact where email=?
      ) contact
    `, [searchDto.email, searchDto.email]);
    const contacts = contactsResp[0];

    await this.databaseService.closeConnection(conn);

    const emailContactsArr = [];
    const emailsSearch = [];

    for (let i=0; i<searchResult[0].length; i++) {
      emailsSearch.push(searchResult[0][i].email);
    }

    for (let i=0; i<contacts.length; i++) {
      emailContactsArr.push(contacts[i].email);
    }

    for (let i=0; i<emailsSearch.length; i++) {
      if (emailContactsArr.indexOf(emailsSearch[i]) !== -1) {
        searchResult[0][i].contact = true;
      } else {
        searchResult[0][i].contact = false;
      }
    }

    return searchResult[0];
  }

  async showNotifications15Ago(showNotificationDto: ShowNotificationDto) {
    let query = `
      select U.id, E.profilepic, E.name, U.email, E.country, A2.descr as front1, A.descr as front2, UQ3.extravalue as back1, A4.descr as back2, A5.descr as back3 from ag_user U, ag_user_quest UQ, ag_entans A, ag_user_quest UQ2, ag_entans A2, ag_user_quest UQ3, ag_user_quest UQ4, ag_entans A4, ag_user_quest UQ5, ag_entans A5, ag_entrepreneur E, ag_profileview P
      WHERE P.email=?
      and P.dateAdded >= date_add(curdate(), INTERVAL -15 DAY)
      and P.emailview=E.email
      and E.email=UQ.email
      and U.email=UQ.email
      and U.qversion=UQ.qversion
      and UQ.qnbr=A.qnbr
      and UQ.qeffdt=A.effdt
      and UQ.anbr=A.anbr
      and A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_entans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      and UQ.qnbr=4
      and U.email=UQ2.email
      and U.qversion=UQ2.qversion
      and UQ2.qnbr=A2.qnbr
      and UQ2.qeffdt=A2.effdt
      and UQ2.anbr=A2.anbr
      and A2.EFFDT= (SELECT MAX(ANS2.EFFDT) FROM ag_entans ANS2 WHERE ANS2.QNBR=A2.QNBR AND ANS2.EFFDT=A2.EFFDT AND ANS2.ANBR=A2.ANBR AND ANS2.STATUS='A' AND ANS2.EFFDT <= SYSDATE())
      and UQ2.qnbr=6
      and U.email=UQ3.email
      and U.qversion=UQ3.qversion
      and UQ3.qnbr=144
      and U.email=UQ4.email
      and U.qversion=UQ4.qversion
      and UQ4.qnbr=A4.qnbr
      and UQ4.qeffdt=A4.effdt
      and UQ4.anbr=A4.anbr
      and A4.EFFDT= (SELECT MAX(ANS4.EFFDT) FROM ag_entans ANS4 WHERE ANS4.QNBR=A4.QNBR AND ANS4.EFFDT=A4.EFFDT AND ANS4.ANBR=A4.ANBR AND ANS4.STATUS='A' AND ANS4.EFFDT <= SYSDATE())
      and UQ4.qnbr=145
      and U.email=UQ5.email
      and U.qversion=UQ5.qversion
      and UQ5.qnbr=A5.qnbr
      and UQ5.qeffdt=A5.effdt
      and UQ5.anbr=A5.anbr
      and A5.EFFDT= (SELECT MAX(ANS5.EFFDT) FROM ag_entans ANS5 WHERE ANS5.QNBR=A5.QNBR AND ANS5.EFFDT=A5.EFFDT AND ANS5.ANBR=A5.ANBR AND ANS5.STATUS='A' AND ANS5.EFFDT <= SYSDATE())
      and UQ5.qnbr=142
      ORDER BY name
    `;

    const conn = await this.databaseService.getConnection();

    const searchResult = await conn.query<RowDataPacket[]>(query, [showNotificationDto.email]);

    const contactsResp = await conn.query<RowDataPacket[]>(`
      select distinct * from 
      (
      select distinct email from ag_contact where emailcontact=?
      union
      select distinct emailcontact from ag_contact where email=?
      ) contact
    `, [showNotificationDto.email, showNotificationDto.email]);
    const contacts = contactsResp[0];

    await this.databaseService.closeConnection(conn);

    const emailContactsArr = [];
    const emailsSearch = [];

    for (let i=0; i<searchResult[0].length; i++) {
      emailsSearch.push(searchResult[0][i].email);
    }

    for (let i=0; i<contacts.length; i++) {
      emailContactsArr.push(contacts[i].email);
    }

    for (let i=0; i<emailsSearch.length; i++) {
      if (emailContactsArr.indexOf(emailsSearch[i]) !== -1) {
        searchResult[0][i].contact = true;
      } else {
        searchResult[0][i].contact = false;
      }
    }

    return searchResult[0];
  }

  async showNotifications(showNotificationDto: ShowNotificationDto) {
    const conn = await this.databaseService.getConnection();

    const notifications = await conn.query(`
      select count(*) notifications from ag_profileview P, ag_entrepreneur E where 
      P.email=? and P.status='P' and P.emailview=E.email
    `, [showNotificationDto.email]);

    await this.databaseService.closeConnection(conn);

    return notifications[0][0];
  }

  async updateShowNotifications(showNotificationDto: ShowNotificationDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      update ag_profileview set status='V' where email=? and emailview in (select email from ag_entrepreneur);
    `, [showNotificationDto.email]);

    await this.databaseService.closeConnection(conn);
  }

  async getScore(showNotificationDto: ShowNotificationDto) {
    const conn = await this.databaseService.getConnection();

    const scoreResp = await conn.query<RowDataPacket[]>(`
      select 
      case
      when maintitle = 'Business strategy and market conditions' then 1
      when maintitle = 'Governance and enterprise risk management (ERM)' then 2
      when maintitle = 'Finances' then 3
      when maintitle = 'Risk assessment' then 4
      when maintitle = 'Future prospects and Innovation projects' then 5
      when maintitle = 'Type of SME and Sustainable Development Goals (SDG)' then 6
      end as orden,
      maintitle, title, EntrepreneurScore, MaxScore, score from
      (
      select maintitle, title, sum(EntrepreneurScore) as EntrepreneurScore, sum(MaxScore) as MaxScore, (sum(EntrepreneurScore) * 100) / sum(MaxScore) as score from
      (
      select UV.id, S.title, S.qnbr, S.maintitle, A.score as EntrepreneurScore, 1 as MaxScore from ag_scoretitle S,  ag_user_quest U, ag_entans A, ag_user UV
      where UV.email=?
      and UV.email=U.email
      and UV.qversion=U.qversion
      and A.qnbr=U.qnbr and A.anbr=U.anbr
      and U.qnbr=S.qnbr
      and A.score <> 0
      order by S.qnbr
      ) Q1
      group by maintitle, title
      UNION
      SELECT 'Finances', 'Financial Performance', SCORE, 10, (SCORE * 100) / 10 as total
      from
      (
      SELECT 
      Case 
      When Mean < 0.05 then 10*1/5
      When Mean < 0.10 then 10*2/5
      When Mean < 0.15 then 10*3/5
      When Mean < 0.2 then 10*4/5
      else 10*5/5
      END as SCORE
      from
      (
      SELECT (Net1/Equi1 + Net2/Equi2 + Net3/Equi3) / 3 as Mean 
      from
      (
      select 
      sum(Net1) as Net1, sum(Net2) as Net2, sum(Net3) as Net3,
      sum(Equi1) as Equi1, sum(Equi2) as Equi2, sum(Equi3) as Equi3
      from
      ( 
      select anbr,
      case when anbr=3 then Val1 else 0 end Net1,
      case when anbr=3 then Val2 else 0 end Net2,
      case when anbr=3 then Val3 else 0 end Net3,
      case when anbr=4 then Val1 else 0 end Equi1,
      case when anbr=4 then Val2 else 0 end Equi2,
      case when anbr=4 then Val3 else 0 end Equi3
      from
      (
      select U.anbr, substring_index(replace(U.extravalue,',',''),'|',1) as Val1, substring_index(substring_index(replace(U.extravalue,',',''),'|',2),'|',-1) as Val2, substring_index(replace(U.extravalue,',',''),'|',-1) as Val3 from ag_user_quest U, ag_user UV
      where UV.email=?
      and UV.email=U.email
      and UV.qversion=U.qversion
      and U.qnbr in ('75','76')
      and U.anbr in (3,4)
      ) SEG1
      group by anbr
      ) PIVOT
      ) TOTAL
      ) Score
      ) FormatTable
      order by maintitle
      ) ordenT order by orden
    `, [showNotificationDto.email, showNotificationDto.email]);

    await this.databaseService.closeConnection(conn);

    let mainArray = [];

    for (let i=0; i<scoreResp[0].length; i++) {
      mainArray.push({
        maintitle: scoreResp[0][i].maintitle,
        countTitles: 0,
        titles: [],
      });
    }

    const counter = {};
    scoreResp[0].forEach(obj => {
      const valor = obj.maintitle;
      counter[valor] = (counter[valor] || 0) + 1;
    });

    const uniqueTitles = [];
    const unique = mainArray.filter(element => {
      const isDuplicate = uniqueTitles.includes(element.maintitle);
    
      if (!isDuplicate) {
        uniqueTitles.push(element.maintitle);
    
        return true;
      }

      return false;
    });

    for (let i=0; i<unique.length; i++) {
      unique[i].countTitles = counter[unique[i].maintitle];
    }

    for (let i=0; i<unique.length; i++) {
      for (let j=0; j<scoreResp[0].length; j++) {
        if (unique[i].maintitle === scoreResp[0][j].maintitle) {
          unique[i].titles.push({
            title: scoreResp[0][j].title,
            score: scoreResp[0][j].score
          });
        }
      }
    }

    return unique;
  }

  async verifyPitchDeck(getDataByIdDto: GetDataByIdDto) {
    const conn = await this.databaseService.getConnection();

    const verifyResp = await conn.query<RowDataPacket[]>(`
      SELECT text FROM ag_pitchdeck WHERE id=? AND section='SPD'
    `, [getDataByIdDto.id]);

    await this.databaseService.closeConnection(conn);

    if (verifyResp[0].length > 0) {
      return {
        response: 1
      };
    }

    return {
      response: 0
    };
  }

  async updateVideo(updateVideoDto: UpdateVideoDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_entrepreneur SET videourl=? WHERE email=?
    `, [updateVideoDto.videoUrl, updateVideoDto.email]);

    await this.databaseService.closeConnection(conn);

    return { message: 'Video updated' };
  }
}
