import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Pool, RowDataPacket } from 'mysql2/promise';

import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { UpdateEntrepreneurInfoDto } from './dto/update-entrepreneur-info';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneur.dto';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';

@Injectable()
export class EntrepreneurService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
    private readonly jwtService: JwtService,
  ){}

  async getDataByEmail(updateEntrepreneurInfoDto: UpdateEntrepreneurInfoDto) {
    const data = await this.pool.query(`
      SELECT name, email_contact, phone, country, city, address, profilepic, backpic, videourl, web, facebook, linkedin, twitter
      FROM ag_entrepreneur WHERE email=?
    `, [updateEntrepreneurInfoDto.email]);

    return data[0][0];
  }

  async getDataById(getDataByIdDto: GetDataByIdDto) {
    const respEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);

    const data = await this.pool.query(`
      SELECT name, email_contact, phone, country, city, address, profilepic, backpic, videourl, web, facebook, linkedin, twitter, aboutus, videodesc
      FROM ag_entrepreneur WHERE email=?
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

    if (verify.length === 0) {
      query = `INSERT INTO ag_entrepreneur(${ field }, email) VALUES(?,?)`;
    }

    await this.pool.query<RowDataPacket[]>(query, [data, updateEntrepreneurInfoDto.email]);

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
}
