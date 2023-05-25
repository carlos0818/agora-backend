import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { lastValueFrom } from 'rxjs';
import { MailService } from 'src/mail/mail.service';
import { RegisterSocialUserDto } from './dto/register-social-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
  ){}

  // User login
  async login(loginUserDto: LoginUserDto) {
    const user = await this.clientPg.query<User>(`
      SELECT firstname, lastname, password, email FROM ag_user WHERE email=$1 AND status=true
    `, [loginUserDto.email]);

    if (user.rows.length === 0) {
      throw new BadRequestException(`Email / password are not valid`);
    }

    if (!bcrypt.compareSync(loginUserDto.password, user.rows[0].password)) {
      throw new BadRequestException(`Email / password are not valid`);
    }

    return {
      fullname: user.rows[0].fullname,
      email: user.rows[0].email,
      token: this.getJwt({
        email: user.rows[0].email,
      })
    };
  }

  // User register
  async register(registerUserDto: RegisterUserDto) {
    const { data } = await this.validateCaptcha(registerUserDto.captcha);

    if (!data.success) {
      throw new BadRequestException(`Incorrect captcha`);
    }
  
    const validateEmail = await this.validateEmail(registerUserDto.email);
  
    if (validateEmail) {
      throw new BadRequestException(`Email ${ registerUserDto.email } is already exists`);
    }
  
    try {
      const password = bcrypt.hashSync(registerUserDto.password, 10);
      // await this.clientPg.query('BEGIN')
      await this.clientPg.query(`
        INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source)
        VALUES($1, $2, true, $3, $4, $5, now(), now(), now(), 'web', 'PR')
      `, [
          registerUserDto.email,
          password,
          registerUserDto.type,
          registerUserDto.fullname,
          'en'
        ]);
      // await this.clientPg.query('COMMIT');

      await this.mailService.sendUserRegister(registerUserDto.email, registerUserDto.password);
  
      return {
        fullname: registerUserDto.fullname,
        email: registerUserDto.email,
        token: this.getJwt({
          email: registerUserDto.email,
        })
      };
    } catch (error) {
      // await this.clientPg.query('ROLLBACK')
      throw new InternalServerErrorException('Unexpected error. Try again.' + error)
    }
  }

  // Verify if user exists in batabase
  async verifySocial(registerSocialUserDto: RegisterSocialUserDto) {
    const validateEmail = await this.validateEmailAndSource(registerSocialUserDto.email, registerSocialUserDto.source);

    if (validateEmail) {
      return {
        fullname: registerSocialUserDto.fullname,
        email: registerSocialUserDto.email,
        token: this.getJwt({
          email: registerSocialUserDto.email,
        })
      };
    }

    this.register(registerSocialUserDto);
  }

  private getJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  // Validate if email is already exists
  private async validateEmail(email: string) {
    const user = await this.clientPg.query(`
      SELECT email FROM ag_user WHERE email=$1
    `, [email]);

    if (user.rows.length > 0) {
      return true;
    }

    return false;
  }

  // Validate if email and source is already exists
  private async validateEmailAndSource(email: string, source: string) {
    const user = await this.clientPg.query(`
      SELECT email FROM ag_user WHERE email=$1
    `, [email]);

    if (user.rows.length > 0) {
      return true;
    }

    return false;
  }

  // validate captcha code
  private async validateCaptcha(captcha: string) {
    return await lastValueFrom(this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.CAPTCHA_SECRET }&response=${ captcha }`))
  }
}
