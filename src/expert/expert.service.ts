import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Pool, RowDataPacket } from 'mysql2/promise';

import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { UpdateExpertInfoDto } from './dto/update-expert-info';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { SearchDto } from './dto/search.dto';
import { ShowNotificationDto } from './dto/show-notification.dto';

@Injectable()
export class ExpertService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
    private readonly jwtService: JwtService,
  ){}

  async getDataByEmail(updateExpertInfoDto: UpdateExpertInfoDto) {
    const data = await this.pool.query(`
      SELECT
      name, email_contact, phone, country, city, address, profilepic, backpic, videourl, videodesc, aboutus, web, facebook, linkedin, twitter, DATE_FORMAT(creationdate, '%b %Y') since
      FROM ag_expert e, ag_user u WHERE u.email=e.email AND e.email=?
    `, [updateExpertInfoDto.email]);

    return data[0][0];
  }

  async getDataById(getDataByIdDto: GetDataByIdDto) {
    const respEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);

    const data = await this.pool.query(`
      SELECT
      name, email_contact, phone, country, city, address, profilepic, backpic, videourl, videodesc, aboutus, web, facebook, linkedin, twitter, DATE_FORMAT(creationdate, '%b %Y') since
      FROM ag_expert e, ag_user u WHERE u.email=e.email AND e.email=?
    `, [respEmail[0][0].email]);

    return data[0][0];
  }

  async updateExpertInfo(updateExpertInfoDto: UpdateExpertInfoDto) {
    const respValidateEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=?
    `, [updateExpertInfoDto.email]);
    const validateEmail = respValidateEmail[0];

    if (validateEmail.length === 0) {
      throw new BadRequestException('The email not found');
    }

    const respVerify = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_expert WHERE email=?
    `, [updateExpertInfoDto.email]);
    const verify = respVerify[0];

    let query = 'UPDATE ag_expert SET ';
    let field = '';
    let data = '';

    if (updateExpertInfoDto.name) {
      query += 'name=?';
      field = 'name';
      data = updateExpertInfoDto.name !== '' ? updateExpertInfoDto.name : null;
    } else if (updateExpertInfoDto.email_contact) {
      query += 'email_contact=?';
      field = 'email_contact';
      data = updateExpertInfoDto.email_contact !== '' ? updateExpertInfoDto.email_contact : null;
    } else if (updateExpertInfoDto.phone) {
      query += 'phone=?';
      field = 'phone';
      data = updateExpertInfoDto.phone !== '' ? updateExpertInfoDto.phone : null;
    } else if (updateExpertInfoDto.country) {
      query += 'country=?';
      field = 'country';
      data = updateExpertInfoDto.country !== '' ? updateExpertInfoDto.country : null;
    } else if (updateExpertInfoDto.city) {
      query += 'city=?';
      field = 'city';
      data = updateExpertInfoDto.city !== '' ? updateExpertInfoDto.city : null;
    } else if (updateExpertInfoDto.address) {
      query += 'address=?';
      field = 'address';
      data = updateExpertInfoDto.address !== '' ? updateExpertInfoDto.address : null;
    } else if (updateExpertInfoDto.profilepic) {
      query += 'profilepic=?';
      field = 'profilepic';
      data = updateExpertInfoDto.profilepic !== '' ? updateExpertInfoDto.profilepic : null;
    } else if (updateExpertInfoDto.backpic) {
      query += 'backpic=?';
      field = 'backpic';
      data = updateExpertInfoDto.backpic !== '' ? updateExpertInfoDto.backpic : null;
    } else if (updateExpertInfoDto.videourl) {
      query += 'videourl=?';
      field = 'videourl';
      data = updateExpertInfoDto.videourl !== '' ? updateExpertInfoDto.videourl : null;
    } else if (updateExpertInfoDto.web) {
      query += 'web=?';
      field = 'web';
      data = updateExpertInfoDto.web !== '' ? updateExpertInfoDto.web : null;
    } else if (updateExpertInfoDto.facebook) {
      query += 'facebook=?';
      field = 'facebook';
      data = updateExpertInfoDto.facebook !== '' ? updateExpertInfoDto.facebook : null;
    } else if (updateExpertInfoDto.linkedin) {
      query += 'linkedin=?';
      field = 'linkedin';
      data = updateExpertInfoDto.linkedin !== '' ? updateExpertInfoDto.linkedin : null;
    } else if (updateExpertInfoDto.twitter) {
      query += 'twitter=?';
      field = 'twitter';
      data = updateExpertInfoDto.twitter !== '' ? updateExpertInfoDto.twitter : null;
    } else if (updateExpertInfoDto.aboutus) {
      query += 'aboutus=?';
      field = 'aboutus';
      data = updateExpertInfoDto.aboutus !== '' ? updateExpertInfoDto.aboutus : null;
    } else if (updateExpertInfoDto.videodesc) {
      query += 'videodesc=?';
      field = 'videodesc';
      data = updateExpertInfoDto.videodesc !== '' ? updateExpertInfoDto.videodesc : null;
    }

    query += ' WHERE email=?';

    if (verify.length === 0) {
      query = `INSERT INTO ag_expert(${ field }, email) VALUES(?,?)`;
    }

    await this.pool.query<RowDataPacket[]>(query, [data, updateExpertInfoDto.email]);

    return {
      message: 'Expert saved'
    }
  }

  async update(updateExpertDto: UpdateExpertDto) {
    let query = 'UPDATE ag_expert SET name=?, email_contact=?, phone=?, country=?, city=?, address=?, ';
    let params = [
      updateExpertDto.name,
      updateExpertDto.email_contact,
      updateExpertDto.phone,
      updateExpertDto.country,
      updateExpertDto.city,
      updateExpertDto.address
    ];

    if(updateExpertDto.profilepic) {
      query += 'profilepic=?, ';
      params.push(updateExpertDto.profilepic);
    }

    if(updateExpertDto.backpic) {
      query += 'backpic=?, ';
      params.push(updateExpertDto.backpic);
    }

    if(updateExpertDto.videourl) {
      query += 'videourl=?, ';
      params.push(updateExpertDto.videourl);
    }

    query += 'web=?, facebook=?, linkedin=?, twitter=? WHERE email=?';
    params.push(updateExpertDto.web);
    params.push(updateExpertDto.facebook);
    params.push(updateExpertDto.linkedin);
    params.push(updateExpertDto.twitter);
    params.push(updateExpertDto.email);

    await this.pool.query(query, params);

    return {
      message: 'Expert saved'
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
      SELECT COUNT(email) response FROM ag_expert
      WHERE name IS NOT NULL AND email_contact IS NOT NULL AND phone IS NOT NULL AND country IS NOT NULL AND city IS NOT NULL AND address IS NOT NULL
      AND profilepic IS NOT NULL AND email=?
    `, [email]);

    if (respValidate[0][0].response === 0) {
      throw new BadRequestException('Required data is not completed');
    }

    return respValidate[0][0];
  }

  async search(searchDto: SearchDto) {
    let query = `
      SELECT * FROM (
      SELECT id, email, profilepic, name, country, typeexpert front1, concat(group_concat(tipo SEPARATOR ' ,'),', etc.') as front2, yearsexp back1, prjlen back2
      from
      (
      select distinct U.id, U.email, E.profilepic, E.name, E.country, A.descr as typeexpert, case 
      when substr(A2.orderby,1,length(A2.orderby) -2) = 5 then 'Financing'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 6 then 'Financial management'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 7 then 'Legal'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 8 then 'Operations'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 9 then 'Human resources'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 10 then 'Vision and leadership'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 11 then 'Marketing'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 12 then 'Sales and commerce'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 13 then 'CSR and impact'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 14 then 'Digital and innovation'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 15 then 'Market development and research'
      end as tipo, UQ3.extravalue as yearsexp, A4.descr as prjlen
      from ag_user U, ag_expans A, ag_user_quest UQ, ag_expans A2, ag_user_quest UQ2, ag_user_quest UQ3,  ag_expans A4, ag_user_quest UQ4, ag_expert E
      WHERE
      E.email=UQ.email
      and U.email=UQ.email
      and U.qversion=UQ.qversion
      and UQ.qnbr=A.qnbr
      and UQ.qeffdt=A.effdt
      and UQ.anbr=A.anbr
      and A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_expans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      and UQ.qnbr=1
      and U.email=UQ2.email
      and U.qversion=UQ2.qversion
      and UQ2.qnbr=A2.qnbr
      and UQ2.qeffdt=A2.effdt
      and UQ2.anbr=A2.anbr
      and A2.EFFDT= (SELECT MAX(ANS2.EFFDT) FROM ag_expans ANS2 WHERE ANS2.QNBR=A2.QNBR AND ANS2.EFFDT=A2.EFFDT AND ANS2.ANBR=A2.ANBR AND ANS2.STATUS='A' AND ANS2.EFFDT <= SYSDATE())
      and UQ2.qnbr=5
      and U.email=UQ3.email
      and U.qversion=UQ3.qversion
      and UQ3.qnbr in (16, 23, 29, 36)
      and U.email=UQ4.email
      and U.qversion=UQ4.qversion
      and UQ4.qnbr=A4.qnbr
      and UQ4.qeffdt=A4.effdt
      and UQ4.anbr=A4.anbr
      and A4.EFFDT= (SELECT MAX(ANS4.EFFDT) FROM ag_expans ANS4 WHERE ANS4.QNBR=A4.QNBR AND ANS4.EFFDT=A4.EFFDT AND ANS4.ANBR=A4.ANBR AND ANS4.STATUS='A' AND ANS4.EFFDT <= SYSDATE())
      and UQ4.qnbr in (17, 24, 30, 37)
    `;
    let parameters = [];

    if (searchDto.term && searchDto.term !== '') {
      query += ` and E.name like ?`;
      parameters.push(`%${ searchDto.term }%`);
    }

    if (searchDto.country && searchDto.country !== '') {
      query += ` and E.country = ?`;
      parameters.push(searchDto.country);
    }

    query += `
      ORDER BY name
      LIMIT 3
      ) expert ) expert2 WHERE front2 IS NOT NULL
    `;

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

  async showNotifications(showNotificationDto: ShowNotificationDto) {
    let query = `
      SELECT * FROM (
      SELECT id, email, profilepic, name, country, typeexpert front1, concat(group_concat(tipo SEPARATOR ' ,'),', etc.') as front2, yearsexp back1, prjlen back2
      from
      (
      select distinct U.id, U.email, E.profilepic, E.name, E.country, A.descr as typeexpert, case 
      when substr(A2.orderby,1,length(A2.orderby) -2) = 5 then 'Financing'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 6 then 'Financial management'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 7 then 'Legal'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 8 then 'Operations'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 9 then 'Human resources'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 10 then 'Vision and leadership'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 11 then 'Marketing'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 12 then 'Sales and commerce'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 13 then 'CSR and impact'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 14 then 'Digital and innovation'
      when substr(A2.orderby,1,length(A2.orderby) -2) = 15 then 'Market development and research'
      end as tipo, UQ3.extravalue as yearsexp, A4.descr as prjlen
      from ag_user U, ag_expans A, ag_user_quest UQ, ag_expans A2, ag_user_quest UQ2, ag_user_quest UQ3,  ag_expans A4, ag_user_quest UQ4, ag_expert E, ag_profileview P
      WHERE
      P.email=?
      and P.emailview=E.email
      and E.email=UQ.email
      and U.email=UQ.email
      and U.qversion=UQ.qversion
      and UQ.qnbr=A.qnbr
      and UQ.qeffdt=A.effdt
      and UQ.anbr=A.anbr
      and A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_expans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      and UQ.qnbr=1
      and U.email=UQ2.email
      and U.qversion=UQ2.qversion
      and UQ2.qnbr=A2.qnbr
      and UQ2.qeffdt=A2.effdt
      and UQ2.anbr=A2.anbr
      and A2.EFFDT= (SELECT MAX(ANS2.EFFDT) FROM ag_expans ANS2 WHERE ANS2.QNBR=A2.QNBR AND ANS2.EFFDT=A2.EFFDT AND ANS2.ANBR=A2.ANBR AND ANS2.STATUS='A' AND ANS2.EFFDT <= SYSDATE())
      and UQ2.qnbr=5
      and U.email=UQ3.email
      and U.qversion=UQ3.qversion
      and UQ3.qnbr in (16, 23, 29, 36)
      and U.email=UQ4.email
      and U.qversion=UQ4.qversion
      and UQ4.qnbr=A4.qnbr
      and UQ4.qeffdt=A4.effdt
      and UQ4.anbr=A4.anbr
      and A4.EFFDT= (SELECT MAX(ANS4.EFFDT) FROM ag_expans ANS4 WHERE ANS4.QNBR=A4.QNBR AND ANS4.EFFDT=A4.EFFDT AND ANS4.ANBR=A4.ANBR AND ANS4.STATUS='A' AND ANS4.EFFDT <= SYSDATE())
      and UQ4.qnbr in (17, 24, 30, 37)
      ORDER BY name
      LIMIT 3
      ) expert ) expert2 WHERE front2 IS NOT NULL
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
}
