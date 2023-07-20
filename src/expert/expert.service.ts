import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Pool, RowDataPacket } from 'mysql2/promise';

import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { UpdateExpertInfoDto } from './dto/update-expert-info';
import { UpdateExpertDto } from './dto/update-expert.dto';

@Injectable()
export class ExpertService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
    private readonly jwtService: JwtService,
  ){}

  async getDataByEmail(updateExpertInfoDto: UpdateExpertInfoDto) {
    const data = await this.pool.query(`
      SELECT name, email_contact, phone, country, city, address, profilepic, backpic, videourl, web, facebook, linkedin, twitter
      FROM ag_expert WHERE email=?
    `, [updateExpertInfoDto.email]);

    return data[0][0];
  }

  async getDataById(getDataByIdDto: GetDataByIdDto) {
    const respEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);

    const data = await this.pool.query(`
      SELECT name, email_contact, phone, country, city, address, profilepic, backpic, videourl, web, facebook, linkedin, twitter, aboutus, videodesc
      FROM ag_expert WHERE email=?
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
}
