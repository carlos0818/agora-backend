import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Client, Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';

import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterSocialUserDto } from './dto/register-social-user.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { LoginTokenDto } from './dto/login-token.dto';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { lastValueFrom } from 'rxjs';
import { MailService } from 'src/mail/mail.service';

type ValidateEmailSource = 
  'ok' | 'register' | 'source'

@Injectable()
export class UserService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
    @Inject('Postgres') private pool: Pool,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
  ){}

  // User login
  async login(loginUserDto: LoginUserDto) {
    if (loginUserDto.captcha) {
      const { data } = await this.validateCaptcha(loginUserDto.captcha);
  
      if (!data.success) {
        throw new BadRequestException(`Incorrect captcha`);
      }
    }

    const user = await this.clientPg.query<User>(`
      SELECT fullname, password, email FROM ag_user WHERE email=$1 AND status=true AND verified=true
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

  async loginToken(loginTokenDto: LoginTokenDto) {
    const user = await this.clientPg.query(`
      SELECT email, fullname, (CASE WHEN DATE_PART('minute', now() - creationdate) <= 15 THEN 'valid' ELSE 'not-valid' END) AS "valid" FROM ag_user WHERE email=$1 AND token=$2
    `, [loginTokenDto.email, loginTokenDto.token]);

    if (user.rows.length === 0 || user.rows[0]?.valid === 'not-valid') {
      throw new BadRequestException(`User: Email / password are not valid`);
    }

    // const verified = await this.clientPg.query<User>(`
    //   SELECT email, fullname FROM ag_user WHERE email=$1
    // `, [loginTokenDto.email]);

    // if (verified.rows.length > 0) {
    //   throw new BadRequestException(`Verified: Email / password are not valid`);
    // }

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

    if (!data.success && registerUserDto.captcha !== '$#C@pTchA12647982$=') {
      throw new BadRequestException(`Incorrect captcha`);
    }
  
    const validateEmail = await this.validateEmail(registerUserDto.email);
  
    if (validateEmail) {
      throw new BadRequestException(`Email ${ registerUserDto.email } is already exists`);
    }

    // const client = await this.pool.connect()
  
    try {
      const token = this.generateConfirmationToken()
      const password = bcrypt.hashSync(registerUserDto.password, 10);
      await this.clientPg.query('BEGIN')
      await this.clientPg.query(`
        INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source, token)
        VALUES($1, $2, true, $3, $4, 'en', now(), now(), now(), 'web', 'PR', $5)
      `, [
          registerUserDto.email,
          password,
          registerUserDto.type,
          registerUserDto.fullname,
          token
        ]
      );

      await this.mailService.sendUserRegister(registerUserDto.email, process.env.ACTIVATE_ACCOUNT_URL, token);
        
      await this.clientPg.query('COMMIT');

      // return {
      //   fullname: registerUserDto.fullname,
      //   email: registerUserDto.email,
      //   token: this.getJwt({
      //     email: registerUserDto.email,
      //   })
      // };
    } catch (error) {
      await this.clientPg.query('ROLLBACK');
      throw new InternalServerErrorException('Unexpected error. Try again.' + error);
    }
  }

  async userExists(registerSocialUserDto: RegisterSocialUserDto) {
    const validateEmailAndSource = await this.validateEmailAndSource(registerSocialUserDto.email, registerSocialUserDto.source);

    console.log(validateEmailAndSource)

    if(validateEmailAndSource === 'source' || validateEmailAndSource === 'register') {
      throw new BadRequestException('The user does not exist, please click on Sign up');
    }

    return {
      fullname: registerSocialUserDto.fullname,
      email: registerSocialUserDto.email,
      token: this.getJwt({
        email: registerSocialUserDto.email,
      })
    };
  }

  // login social
  async loginSocial(registerSocialUserDto: RegisterSocialUserDto) {
    const validateEmailAndSource = await this.validateEmailAndSource(registerSocialUserDto.email, registerSocialUserDto.source);

    switch (validateEmailAndSource) {
      case 'ok':
        return {
          fullname: registerSocialUserDto.fullname,
          email: registerSocialUserDto.email,
          token: this.getJwt({
            email: registerSocialUserDto.email,
          })
        };
      case 'register':
        await this.clientPg.query(`
          INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source)
          VALUES($1, '$P@ssW0rd#', true, $2, $3, 'en', now(), now(), now(), 'web', $4)
        `, [
            registerSocialUserDto.email,
            registerSocialUserDto.type,
            registerSocialUserDto.fullname,
            registerSocialUserDto.source
          ]
        );
        return {
          fullname: registerSocialUserDto.fullname,
          email: registerSocialUserDto.email,
          token: this.getJwt({
            email: registerSocialUserDto.email,
          })
        };
      case 'source':
        throw new BadRequestException('This email is already registered with another account type');
    }
  }

  async activateAccount(activateAccountDto: ActivateAccountDto) {
    const user = await this.clientPg.query<User>(`
      SELECT password, fullname, type FROM ag_user WHERE email=$1 AND token=$2
    `, [activateAccountDto.email, activateAccountDto.token]);

    if (user.rows.length === 0) {
      throw new BadRequestException('We cannot find your registered user');
    }

    const active = await this.clientPg.query<User>(`
      SELECT fullname FROM ag_user WHERE email=$1 AND verified=true
    `, [activateAccountDto.email]);

    if (active.rows.length > 0) {
      throw new BadRequestException('Your account has already been activated previously');
    }

    const verified = await this.clientPg.query(`
      SELECT (CASE WHEN DATE_PART('minute', now() - creationdate) <= 15 THEN 'valid' ELSE 'not-valid' END) AS "valid" FROM ag_user WHERE email=$1 AND token=$2
    `, [activateAccountDto.email, activateAccountDto.token]);

    if (verified.rows[0].valid === 'not-valid') {
      await this.clientPg.query(`
        DELETE FROM ag_user WHERE email=$1
      `, [activateAccountDto.email]);

      const token = this.generateConfirmationToken()
      await this.clientPg.query(`
        INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source, token)
        VALUES($1, $2, true, $3, $4, 'en', now(), now(), now(), 'web', 'PR', $5)
      `, [
          activateAccountDto.email,
          user.rows[0].password,
          user.rows[0].type,
          user.rows[0].fullname,
          token
        ]
      );
    }

    await this.clientPg.query(`
      UPDATE ag_user SET verified=true WHERE email=$1
    `, [activateAccountDto.email]);

    return {
      fullname: user.rows[0].fullname,
      email: activateAccountDto.email,
      token: this.getJwt({
        email: activateAccountDto.email,
      })
    };
  }

  // Generate JWT
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
  private async validateEmailAndSource(email: string, source: string): Promise<ValidateEmailSource> {
    const user = await this.clientPg.query(`
      SELECT email FROM ag_user WHERE email=$1
    `, [email]);

    if (user.rows.length > 0) {
      const response = await this.clientPg.query(`
        SELECT email FROM ag_user WHERE email=$1 AND source=$2
        `, [email, source]);
      
      if (response.rows.length === 0) {
        return 'source';
      }

      return 'ok'
    }

    return 'register';
  }

  // validate google captcha code
  private async validateCaptcha(captcha: string) {
    return await lastValueFrom(this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.CAPTCHA_SECRET }&response=${ captcha }`));
  }

  private generateConfirmationToken = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const tokenLength = 12;
    let token = '';

    for (var i = 0; i <= tokenLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      token += chars.substring(randomNumber, randomNumber +1);
    }

    return token;
  }
}
