import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';

import { Pool, RowDataPacket } from 'mysql2/promise';
import { HttpService } from '@nestjs/axios';

import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { UpdateEntrepreneurInfoDto } from './dto/update-entrepreneur-info';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneur.dto';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { SearchDto } from './dto/search.dto';
import { ShowNotificationDto } from './dto/show-notification.dto';

console.log(process.env.OPENAI_API_KEY);

@Injectable()
export class EntrepreneurService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ){}

  async getDataByEmail(updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    const data = await this.pool.query(`
      SELECT
      name, email_contact, phone, country, city, address, profilepic, backpic, videourl, videodesc, aboutus, web, facebook, linkedin, twitter, DATE_FORMAT(creationdate, '%b %Y') since
      FROM ag_entrepreneur e, ag_user u WHERE u.email=e.email AND e.email=?
    `, [updateEntrepreneurInfoDto.email]);

    return data[0][0];
  }

  async getDataById(getDataByIdDto: GetDataByIdDto) {
    const respEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);

    const data = await this.pool.query(`
      SELECT
      name, email_contact, phone, country, city, address, profilepic, backpic, videourl, videodesc, aboutus, web, facebook, linkedin, twitter, DATE_FORMAT(creationdate, '%b %Y') since
      FROM ag_user u LEFT OUTER JOIN ag_entrepreneur e ON(u.email=e.email) WHERE u.email=?
    `, [respEmail[0][0].email]);

    return data[0][0];
  }

  async updateEntrepreneurInfo(updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    const respValidateEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=?
    `, [updateEntrepreneurInfoDto.email]);
    const validateEmail = respValidateEmail[0];

    if (validateEmail.length === 0) {
      throw new BadRequestException('The email not found');
    }

    const respVerify = await this.pool.query<RowDataPacket[]>(`
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
      await this.pool.query<RowDataPacket[]>(query, [data, updateEntrepreneurInfoDto.email]);
    }

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

    await this.pool.query(query, params);

    return {
      message: 'Entrepreneur saved'
    }
  }

  async validateRequiredData(getDataByIdDto: GetDataByIdDto, token: string) {
    const decoded = this.jwtService.decode(token) as JwtPayload;
    const respEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);
    const email = respEmail[0][0].email;

    if (!decoded) {
      throw new UnauthorizedException('');
    }

    if (decoded.email === email) {
      return { response: 1 }
    }

    const respValidate = await this.pool.query<RowDataPacket[]>(`
      SELECT COUNT(email) response FROM ag_entrepreneur
      WHERE name IS NOT NULL AND email_contact IS NOT NULL AND phone IS NOT NULL AND country IS NOT NULL AND city IS NOT NULL AND address IS NOT NULL
      AND profilepic IS NOT NULL AND email=?
    `, [email]);

    if (respValidate[0][0].response === 0) {
      throw new BadRequestException('Required data is not completed');
    }

    return respValidate[0][0];
  }

  async getCompanySize() {
    const types = await this.pool.query(`
      SELECT anbr, descr FROM ag_entans A WHERE A.QNBR=4 AND A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_entans ANS
      WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      ORDER BY orderby
    `);

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

    const searchResult = await this.pool.query<RowDataPacket[]>(query, parameters);

    const contactsResp = await this.pool.query<RowDataPacket[]>(`
      select distinct * from 
      (
      select distinct email from ag_contact where emailcontact=?
      union
      select distinct emailcontact from ag_contact where email=?
      ) contact
    `, [searchDto.email, searchDto.email]);
    const contacts = contactsResp[0];

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

    const searchResult = await this.pool.query<RowDataPacket[]>(query, [showNotificationDto.email]);

    const contactsResp = await this.pool.query<RowDataPacket[]>(`
      select distinct * from 
      (
      select distinct email from ag_contact where emailcontact=?
      union
      select distinct emailcontact from ag_contact where email=?
      ) contact
    `, [showNotificationDto.email, showNotificationDto.email]);
    const contacts = contactsResp[0];

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
    const notifications = await this.pool.query(`
      select count(*) notifications from ag_profileview P, ag_entrepreneur E where 
      P.email=? and P.status='P' and P.emailview=E.email
    `, [showNotificationDto.email]);

    return notifications[0][0];
  }

  async updateShowNotifications(showNotificationDto: ShowNotificationDto) {
    await this.pool.query(`
      update ag_profileview set status='V' where email=? and emailview in (select email from ag_entrepreneur);
    `, [showNotificationDto.email]);
  }

  async getScore(showNotificationDto: ShowNotificationDto) {
    const scoreResp = await this.pool.query<RowDataPacket[]>(`
      select maintitle, title, sum(EntrepreneurScore) as EntrepreneurScore, sum(MaxScore) as MaxScore, round((sum(EntrepreneurScore) * 100) / sum(MaxScore), 2) as score from
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
      order by maintitle
    `, [showNotificationDto.email]);

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

  async generateAboutUs(showNotificationDto: ShowNotificationDto) {
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
    `, [showNotificationDto.email, showNotificationDto.email]);

    console.log(dataResp[0]);

    const resp1 = dataResp[0][0].R3;
    const resp2 = dataResp[0][1].R3;
    const resp3 = dataResp[0][2].R3;
    const resp5 = dataResp[0][3].R3;
    const resp6 = dataResp[0][4].R3;
    const resp37 = dataResp[0][5].R3;
    const resp38 = dataResp[0][6].R3;
    const respCO = dataResp[0][7].R3;

    console.log('resp1', resp1);
    console.log('resp2', resp2);
    console.log('resp3', resp3);
    console.log('resp5', resp5);
    console.log('resp6', resp6);
    console.log('resp37', resp37);
    console.log('resp38', resp38);
    console.log('respCO', respCO);

    const { data } = await lastValueFrom(this.httpService.post(`https://services.agora-sme.org/pitch-deck`, {
      resp1,
      resp2,
      resp3,
      resp5,
      resp6,
      resp37,
      resp38,
      respCO,
    }));
    console.log(data);
    return data.data.choices[0].message.content;
  }
}
