import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Pool, RowDataPacket } from 'mysql2/promise';

import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { UpdateInvestorInfoDto } from './dto/update-investor-info';
import { GetDataByIdDto } from './dto/get-data-by-id.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';

@Injectable()
export class InvestorService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
    private readonly jwtService: JwtService,
  ){}

  async getDataByEmail(updateInvestorInfoDto: UpdateInvestorInfoDto) {
    const data = await this.pool.query(`
      SELECT name, email_contact, phone, country, city, address, profilepic, backpic, videourl, web, facebook, linkedin, twitter
      FROM ag_investor WHERE email=?
    `, [updateInvestorInfoDto.email]);

    return data[0][0];
  }

  async getDataById(getDataByIdDto: GetDataByIdDto) {
    const respEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE id=?
    `, [getDataByIdDto.id]);

    const data = await this.pool.query(`
      SELECT name, email_contact, phone, country, city, address, profilepic, backpic, videourl, web, facebook, linkedin, twitter, aboutus, videodesc
      FROM ag_investor WHERE email=?
    `, [respEmail[0][0].email]);

    return data[0][0];
  }

  async updateInvestorInfo(updateInvestorInfoDto: UpdateInvestorInfoDto) {
    const respValidateEmail = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=?
    `, [updateInvestorInfoDto.email]);
    const validateEmail = respValidateEmail[0];

    if (validateEmail.length === 0) {
      throw new BadRequestException('The email not found');
    }

    const respVerify = await this.pool.query<RowDataPacket[]>(`
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

    await this.pool.query<RowDataPacket[]>(query, [data, updateInvestorInfoDto.email]);

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

    await this.pool.query(query, params);

    return {
      message: 'Investor saved'
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
      SELECT COUNT(email) response FROM ag_investor
      WHERE name IS NOT NULL AND email_contact IS NOT NULL AND phone IS NOT NULL AND country IS NOT NULL AND city IS NOT NULL AND address IS NOT NULL
      AND profilepic IS NOT NULL AND email=?
    `, [email]);

    if (respValidate[0][0].response === 0) {
      throw new BadRequestException('Required data is not completed');
    }

    return respValidate[0][0];
  }
}
