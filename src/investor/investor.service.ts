import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Pool, RowDataPacket } from 'mysql2/promise';

import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { UpdateInvestorInfoDto } from './dto/update-investor-info';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';
import { SearchDto } from './dto/search.dto';
import { ShowNotificationDto } from './dto/show-notification.dto';
import { DatabaseService } from 'src/database/database.service';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class InvestorService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ){}

  async getDataByEmail(updateInvestorInfoDto: UpdateInvestorInfoDto) {
    const conn = await this.databaseService.getConnection();

    const data = await conn.query(`
      SELECT
      name, email_contact, phone, country, city, address, profilepic, backpic, videourl, videodesc, aboutus, web, facebook, linkedin, twitter, DATE_FORMAT(creationdate, '%b %Y') since
      FROM ag_investor i, ag_user u WHERE u.email=i.email AND i.email=?
    `, [updateInvestorInfoDto.email]);

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
      FROM ag_user u LEFT OUTER JOIN ag_investor i ON(u.email=i.email) WHERE u.email=?
    `, [respEmail[0][0].email]);

    await this.databaseService.closeConnection(conn);

    return data[0][0];
  }

  async updateInvestorInfo(updateInvestorInfoDto: UpdateInvestorInfoDto) {
    const conn = await this.databaseService.getConnection();

    const respValidateEmail = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=?
    `, [updateInvestorInfoDto.email]);
    const validateEmail = respValidateEmail[0];

    if (validateEmail.length === 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException('The email not found');
    }

    const respVerify = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_investor WHERE email=?
    `, [updateInvestorInfoDto.email]);
    const verify = respVerify[0];

    let query = 'UPDATE ag_investor SET ';
    let field = '';
    let data = '';

    if (updateInvestorInfoDto.name) {
      query += 'name=?';
      field = 'name';
      data = updateInvestorInfoDto.name !== '' ? updateInvestorInfoDto.name : null;
    } else if (updateInvestorInfoDto.email_contact) {
      query += 'email_contact=?';
      field = 'email_contact';
      data = updateInvestorInfoDto.email_contact !== '' ? updateInvestorInfoDto.email_contact : null;
    } else if (updateInvestorInfoDto.phone) {
      query += 'phone=?';
      field = 'phone';
      data = updateInvestorInfoDto.phone !== '' ? updateInvestorInfoDto.phone : null;
    } else if (updateInvestorInfoDto.country) {
      query += 'country=?';
      field = 'country';
      data = updateInvestorInfoDto.country !== '' ? updateInvestorInfoDto.country : null;
    } else if (updateInvestorInfoDto.city) {
      query += 'city=?';
      field = 'city';
      data = updateInvestorInfoDto.city !== '' ? updateInvestorInfoDto.city : null;
    } else if (updateInvestorInfoDto.address) {
      query += 'address=?';
      field = 'address';
      data = updateInvestorInfoDto.address !== '' ? updateInvestorInfoDto.address : null;
    } else if (updateInvestorInfoDto.profilepic) {
      query += 'profilepic=?';
      field = 'profilepic';
      data = updateInvestorInfoDto.profilepic !== '' ? updateInvestorInfoDto.profilepic : null;
    } else if (updateInvestorInfoDto.backpic) {
      query += 'backpic=?';
      field = 'backpic';
      data = updateInvestorInfoDto.backpic !== '' ? updateInvestorInfoDto.backpic : null;
    } else if (updateInvestorInfoDto.videourl) {
      query += 'videourl=?';
      field = 'videourl';
      data = updateInvestorInfoDto.videourl !== '' ? updateInvestorInfoDto.videourl : null;
    } else if (updateInvestorInfoDto.web) {
      query += 'web=?';
      field = 'web';
      data = updateInvestorInfoDto.web !== '' ? updateInvestorInfoDto.web : null;
    } else if (updateInvestorInfoDto.facebook) {
      query += 'facebook=?';
      field = 'facebook';
      data = updateInvestorInfoDto.facebook !== '' ? updateInvestorInfoDto.facebook : null;
    } else if (updateInvestorInfoDto.linkedin) {
      query += 'linkedin=?';
      field = 'linkedin';
      data = updateInvestorInfoDto.linkedin !== '' ? updateInvestorInfoDto.linkedin : null;
    } else if (updateInvestorInfoDto.twitter) {
      query += 'twitter=?';
      field = 'twitter';
      data = updateInvestorInfoDto.twitter !== '' ? updateInvestorInfoDto.twitter : null;
    } else if (updateInvestorInfoDto.aboutus) {
      query += 'aboutus=?';
      field = 'aboutus';
      data = updateInvestorInfoDto.aboutus !== '' ? updateInvestorInfoDto.aboutus : null;
    } else if (updateInvestorInfoDto.videodesc) {
      query += 'videodesc=?';
      field = 'videodesc';
      data = updateInvestorInfoDto.videodesc !== '' ? updateInvestorInfoDto.videodesc : null;
    }

    query += ' WHERE email=?';

    if (verify.length === 0) {
      query = `INSERT INTO ag_investor(${ field }, email) VALUES(?,?)`;
    }

    await conn.query<RowDataPacket[]>(query, [data, updateInvestorInfoDto.email]);

    await this.databaseService.closeConnection(conn);

    return {
      message: 'Investor saved'
    }
  }

  async update(updateInvestorDto: UpdateInvestorDto) {
    let query = 'UPDATE ag_investor SET name=?, email_contact=?, phone=?, country=?, city=?, address=?, ';
    let params = [
      updateInvestorDto.name,
      updateInvestorDto.email_contact,
      updateInvestorDto.phone,
      updateInvestorDto.country,
      updateInvestorDto.city,
      updateInvestorDto.address
    ];

    if(updateInvestorDto.profilepic) {
      query += 'profilepic=?, ';
      params.push(updateInvestorDto.profilepic);
    }

    if(updateInvestorDto.backpic) {
      query += 'backpic=?, ';
      params.push(updateInvestorDto.backpic);
    }

    if(updateInvestorDto.videourl) {
      query += 'videourl=?, ';
      params.push(updateInvestorDto.videourl);
    }

    query += 'web=?, facebook=?, linkedin=?, twitter=? WHERE email=?';
    params.push(updateInvestorDto.web);
    params.push(updateInvestorDto.facebook);
    params.push(updateInvestorDto.linkedin);
    params.push(updateInvestorDto.twitter);
    params.push(updateInvestorDto.email);

    const conn = await this.databaseService.getConnection();

    await conn.query(query, params);

    await this.databaseService.closeConnection(conn);

    return {
      message: 'Investor saved'
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
      SELECT COUNT(email) response FROM ag_investor
      WHERE name IS NOT NULL AND email_contact IS NOT NULL AND phone IS NOT NULL AND country IS NOT NULL AND city IS NOT NULL AND address IS NOT NULL
      AND profilepic IS NOT NULL AND email=?
    `, [email]);

    await this.databaseService.closeConnection(conn);

    if (respValidate[0][0].response === 0) {
      throw new BadRequestException('Required data is not completed');
    }

    return respValidate[0][0];
  }

  async search(searchDto: SearchDto) {
    let query = `
      SELECT * FROM (
      SELECT id, email, profilepic, name, country, concat(group_concat(actareas SEPARATOR ', '),', etc.') as front1, opinv as front2, RiskPref as back1, invOffered as back2, MinInvest as back3
      from
      (
      select U.id, U.email, I.profilepic, I.name, I.country, A.descr as actareas, A2.descr as opinv, A3.descr as RiskPref, A4.descr as invOffered, A5.descr as MinInvest from ag_user U, ag_user_quest UQ, ag_invans A, ag_user_quest UQ2, ag_invans A2, ag_user_quest UQ3, ag_invans A3, ag_user_quest UQ4, ag_invans A4, ag_user_quest UQ5, ag_invans A5, ag_investor I
      WHERE
      I.email=UQ.email
      and U.email=UQ.email
      and U.qversion=UQ.qversion
      and UQ.qnbr=A.qnbr
      and UQ.qeffdt=A.effdt
      and UQ.anbr=A.anbr
      and A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_invans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      and UQ.qnbr=3
    `;
    let parameters = [];

    if (searchDto.interest && searchDto.interest !== '') {
      query += ` and A.descr = ?`;
      parameters.push(searchDto.interest);
    }

    query += `and U.email=UQ2.email
      and U.qversion=UQ2.qversion
      and UQ2.qnbr=A2.qnbr
      and UQ2.qeffdt=A2.effdt
      and UQ2.anbr=A2.anbr
      and A2.EFFDT= (SELECT MAX(ANS2.EFFDT) FROM ag_invans ANS2 WHERE ANS2.QNBR=A2.QNBR AND ANS2.EFFDT=A2.EFFDT AND ANS2.ANBR=A2.ANBR AND ANS2.STATUS='A' AND ANS2.EFFDT <= SYSDATE())
      and UQ2.qnbr=6
      and U.email=UQ3.email
      and U.qversion=UQ3.qversion
      and UQ3.qnbr=A3.qnbr
      and UQ3.qeffdt=A3.effdt
      and UQ3.anbr=A3.anbr
      and A3.EFFDT= (SELECT MAX(ANS3.EFFDT) FROM ag_invans ANS3 WHERE ANS3.QNBR=A3.QNBR AND ANS3.EFFDT=A3.EFFDT AND ANS3.ANBR=A3.ANBR AND ANS3.STATUS='A' AND ANS3.EFFDT <= SYSDATE())
      and UQ3.qnbr=7
      and U.email=UQ4.email
      and U.qversion=UQ4.qversion
      and UQ4.qnbr=A4.qnbr
      and UQ4.qeffdt=A4.effdt
      and UQ4.anbr=A4.anbr
      and A4.EFFDT= (SELECT MAX(ANS4.EFFDT) FROM ag_invans ANS4 WHERE ANS4.QNBR=A4.QNBR AND ANS4.EFFDT=A4.EFFDT AND ANS4.ANBR=A4.ANBR AND ANS4.STATUS='A' AND ANS4.EFFDT <= SYSDATE())
      and UQ4.qnbr=8
      and U.email=UQ5.email
      and U.qversion=UQ5.qversion
      and UQ5.qnbr=A5.qnbr
      and UQ5.qeffdt=A5.effdt
      and UQ5.anbr=A5.anbr
      and A5.EFFDT= (SELECT MAX(ANS5.EFFDT) FROM ag_invans ANS5 WHERE ANS5.QNBR=A5.QNBR AND ANS5.EFFDT=A5.EFFDT AND ANS5.ANBR=A5.ANBR AND ANS5.STATUS='A' AND ANS5.EFFDT <= SYSDATE())
      and UQ5.qnbr=15
    `;

    if (searchDto.term && searchDto.term !== '') {
      query += ` and I.name like ?`;
      parameters.push(`%${ searchDto.term }%`);
    }

    if (searchDto.country && searchDto.country !== '') {
      query += ` and I.country = ?`;
      parameters.push(searchDto.country);
    }

    query += `
      ORDER BY name
      LIMIT 3
      ) INV
      ) INV2 WHERE front1 IS NOT NULL
    `;

    // console.log(query);

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
      SELECT * FROM (
      SELECT id, email, profilepic, name, country, concat(group_concat(actareas SEPARATOR ', '),', etc.') as front1, opinv as front2, RiskPref as back1, invOffered as back2, MinInvest as back3
      from
      (
      select U.id, U.email, I.profilepic, I.name, I.country, A.descr as actareas, A2.descr as opinv, A3.descr as RiskPref, A4.descr as invOffered, A5.descr as MinInvest from ag_user U, ag_user_quest UQ, ag_invans A, ag_user_quest UQ2, ag_invans A2, ag_user_quest UQ3, ag_invans A3, ag_user_quest UQ4, ag_invans A4, ag_user_quest UQ5, ag_invans A5, ag_investor I, ag_profileview P
      WHERE
      P.email=?
      and P.dateAdded >= date_add(curdate(), INTERVAL -15 DAY)
      and P.emailview=I.email
      and I.email=UQ.email
      and U.email=UQ.email
      and U.qversion=UQ.qversion
      and UQ.qnbr=A.qnbr
      and UQ.qeffdt=A.effdt
      and UQ.anbr=A.anbr
      and A.EFFDT= (SELECT MAX(ANS.EFFDT) FROM ag_invans ANS WHERE ANS.QNBR=A.QNBR AND ANS.EFFDT=A.EFFDT AND ANS.ANBR=A.ANBR AND ANS.STATUS='A' AND ANS.EFFDT <= SYSDATE())
      and UQ.qnbr=3
      and U.email=UQ2.email
      and U.qversion=UQ2.qversion
      and UQ2.qnbr=A2.qnbr
      and UQ2.qeffdt=A2.effdt
      and UQ2.anbr=A2.anbr
      and A2.EFFDT= (SELECT MAX(ANS2.EFFDT) FROM ag_invans ANS2 WHERE ANS2.QNBR=A2.QNBR AND ANS2.EFFDT=A2.EFFDT AND ANS2.ANBR=A2.ANBR AND ANS2.STATUS='A' AND ANS2.EFFDT <= SYSDATE())
      and UQ2.qnbr=6
      and U.email=UQ3.email
      and U.qversion=UQ3.qversion
      and UQ3.qnbr=A3.qnbr
      and UQ3.qeffdt=A3.effdt
      and UQ3.anbr=A3.anbr
      and A3.EFFDT= (SELECT MAX(ANS3.EFFDT) FROM ag_invans ANS3 WHERE ANS3.QNBR=A3.QNBR AND ANS3.EFFDT=A3.EFFDT AND ANS3.ANBR=A3.ANBR AND ANS3.STATUS='A' AND ANS3.EFFDT <= SYSDATE())
      and UQ3.qnbr=7
      and U.email=UQ4.email
      and U.qversion=UQ4.qversion
      and UQ4.qnbr=A4.qnbr
      and UQ4.qeffdt=A4.effdt
      and UQ4.anbr=A4.anbr
      and A4.EFFDT= (SELECT MAX(ANS4.EFFDT) FROM ag_invans ANS4 WHERE ANS4.QNBR=A4.QNBR AND ANS4.EFFDT=A4.EFFDT AND ANS4.ANBR=A4.ANBR AND ANS4.STATUS='A' AND ANS4.EFFDT <= SYSDATE())
      and UQ4.qnbr=8
      and U.email=UQ5.email
      and U.qversion=UQ5.qversion
      and UQ5.qnbr=A5.qnbr
      and UQ5.qeffdt=A5.effdt
      and UQ5.anbr=A5.anbr
      and A5.EFFDT= (SELECT MAX(ANS5.EFFDT) FROM ag_invans ANS5 WHERE ANS5.QNBR=A5.QNBR AND ANS5.EFFDT=A5.EFFDT AND ANS5.ANBR=A5.ANBR AND ANS5.STATUS='A' AND ANS5.EFFDT <= SYSDATE())
      and UQ5.qnbr=15
      ORDER BY name
      LIMIT 3
      ) INV
      ) INV2 WHERE front1 IS NOT NULL
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
      select count(*) notifications from ag_profileview P, ag_investor I where 
      P.email=? and P.status='P' and P.emailview=I.email
    `, [showNotificationDto.email]);

    await this.databaseService.closeConnection(conn);

    return notifications[0][0];
  }

  async updateShowNotifications(showNotificationDto: ShowNotificationDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      update ag_profileview set status='V' where email=? and emailview in (select email from ag_investor)
    `, [showNotificationDto.email]);

    await this.databaseService.closeConnection(conn);
  }

  async updateVideo(updateVideoDto: UpdateVideoDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_investor SET videourl=? WHERE email=?
    `, [updateVideoDto.videoUrl, updateVideoDto.email]);

    await this.databaseService.closeConnection(conn);

    return { message: 'Video updated' };
  }
}
