import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Pool, RowDataPacket } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterSocialUserDto } from './dto/register-social-user.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { LoginTokenDto } from './dto/login-token.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { User } from './entities/user.entity';

import { MailService } from 'src/mail/mail.service';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { lastValueFrom } from 'rxjs';
import { UpdateUserInfoDto } from './dto/update-user-info.';

// type ValidateEmailSource = 
//   User | 'register' | 'source'

@Injectable()
export class UserService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
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

    const user = await this.pool.query<RowDataPacket[]>(`
      SELECT fullname, password, email, type FROM ag_user WHERE email=? AND status='1' AND verified='1'
    `, [loginUserDto.email]);

    if (user[0].length === 0) {
      throw new BadRequestException(`Incorrect credentials`);
    }

    if (!bcrypt.compareSync(loginUserDto.password, user[0][0].password)) {
      throw new BadRequestException(`Incorrect credentials`);
    }

    await this.pool.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [loginUserDto.email]);

    return {
      fullname: user[0][0].fullname,
      email: user[0][0].email,
      type: user[0][0].type,
      token: this.getJwt({
        email: user[0][0].email,
      })
    };
  }

  async loginToken(loginTokenDto: LoginTokenDto) {
    const user = await this.pool.query<RowDataPacket[]>(`
      SELECT email, fullname, type, (CASE WHEN TIMESTAMPDIFF('minute', NOW() - creationdate) <= 15 THEN 'valid' ELSE 'not-valid' END) AS "valid"
      FROM ag_user WHERE email=? AND token=?
    `, [loginTokenDto.email, loginTokenDto.token]);

    if (user[0].length === 0 || user[0][0].valid === 'not-valid') {
      throw new BadRequestException(`User: Incorrect credentials`);
    }

    await this.pool.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [loginTokenDto.email]);

    return {
      fullname: user[0][0].fullname,
      email: user[0][0].email,
      type: user[0][0].type,
      token: this.getJwt({
        email: user[0][0].email,
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
  
    try {
      const token = this.generateConfirmationToken()
      const password = bcrypt.hashSync(registerUserDto.password, 10);
      await this.pool.query(`
        INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source, token)
        VALUES(?, ?, '1', ?, ?, 'en', now(), now(), now(), 'web', 'PR', ?)
      `, [
          registerUserDto.email,
          password,
          registerUserDto.type,
          registerUserDto.fullname,
          token
        ]
      );

      await this.mailService.sendUserRegister(registerUserDto.email, process.env.ACTIVATE_ACCOUNT_URL, token);

      return { message: 'User was created' }
    } catch (error) {
      
      throw new InternalServerErrorException('Unexpected error, try again.' + error);
    }
  }

  async userExists(registerSocialUserDto: RegisterSocialUserDto) {
    const validateEmailAndSource = await this.validateEmailAndSource(registerSocialUserDto.email, registerSocialUserDto.source);

    if(validateEmailAndSource.response === 'source' || validateEmailAndSource.response === 'register') {
      throw new BadRequestException('The user does not exist, please click on Sign up');
    }

    await this.pool.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [registerSocialUserDto.email]);

    return {
      fullname: registerSocialUserDto.fullname,
      email: registerSocialUserDto.email,
      type: validateEmailAndSource.user.type,
      token: this.getJwt({
        email: registerSocialUserDto.email,
      })
    };
  }

  // login social
  async loginSocial(registerSocialUserDto: RegisterSocialUserDto) {
    
    const validateEmailAndSource = await this.validateEmailAndSource(registerSocialUserDto.email, registerSocialUserDto.source);

    console.log(validateEmailAndSource);

    switch (validateEmailAndSource.response) {
      case 'ok':
        await this.pool.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [registerSocialUserDto.email]);
        
        return {
          fullname: registerSocialUserDto.fullname,
          email: registerSocialUserDto.email,
          type: validateEmailAndSource.user.type,
          token: this.getJwt({
            email: registerSocialUserDto.email,
          })
        };
      case 'register':
        await this.pool.query(`
          INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source)
          VALUES(?, '$P@ssW0rd#', '1', ?, ?, 'en', now(), now(), now(), 'web', ?)
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
          type: registerSocialUserDto.type,
          token: this.getJwt({
            email: registerSocialUserDto.email,
          })
        };
      case 'source':
        throw new BadRequestException('This email is already registered with another account type');
    }
  }

  async activateAccount(activateAccountDto: ActivateAccountDto) {
    const user = await this.pool.query<RowDataPacket[]>(`
      SELECT password, fullname, type FROM ag_user WHERE email=? AND token=?
    `, [activateAccountDto.email, activateAccountDto.token]);

    if (user[0].length === 0) {
      throw new BadRequestException('We cannot find your registered user');
    }

    const active = await this.pool.query<RowDataPacket[]>(`
      SELECT fullname FROM ag_user WHERE email=? AND verified='1'
    `, [activateAccountDto.email]);

    if (active[0].length > 0) {
      throw new BadRequestException('Your account has already been activated previously');
    }

    const verified = await this.pool.query(`
      SELECT (CASE WHEN TIMESTAMPDIFF(MINUTE, NOW(), creationdate) <= 15 THEN 'valid' ELSE 'not-valid' END) AS "valid" FROM ag_user WHERE email=? AND token=?
    `, [activateAccountDto.email, activateAccountDto.token]);

    if (verified[0][0].valid === 'not-valid') {
      await this.pool.query(`
        DELETE FROM ag_user WHERE email=?
      `, [activateAccountDto.email]);

      const token = this.generateConfirmationToken()
      await this.pool.query(`
        INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source, token)
        VALUES(?, ?, '1', ?, ?, 'en', NOW(), NOW(), NOW(), 'web', 'PR', ?)
      `, [
          activateAccountDto.email,
          user[0][0].password,
          user[0][0].type,
          user[0][0].fullname,
          token
        ]);
    }

    await this.pool.query(`
      UPDATE ag_user SET verified=true WHERE email=?
    `, [activateAccountDto.email]);

    return {
      fullname: user[0][0].fullname,
      email: activateAccountDto.email,
      type: user[0][0].type,
      token: this.getJwt({
        email: activateAccountDto.email,
      })
    }
  }

  async verifyUser(verifyUserDto: VerifyUserDto) {
    // const respVerify = await this.connection.query(`
    //   SELECT
    // `, []);
  }

  async updateUserInfo(updateUserInfoDto: UpdateUserInfoDto) {
    await this.pool.query(`
      UPDATE ag_user SET fullname=? WHERE email=?
    `, [updateUserInfoDto.fullname, updateUserInfoDto.email]);
  }

  async loadUserData(verifyUserDto: VerifyUserDto) {
    const user = await this.pool.query(`
      SELECT email, fullname FROM ag_user WHERE email=?
    `, [verifyUserDto.email]);

    return user[0][0];
  }

  // Generate JWT
  private getJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  // Validate if email is already exists
  private async validateEmail(email: string) {
    const user = await this.pool.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=?
    `, [email]);

    if (user[0].length > 0) {
      return true;
    }

    return false;
  }

  // Validate if email and source is already exists
  private async validateEmailAndSource(email: string, source: string) {
    const user = await this.pool.query<RowDataPacket[]>(`
      SELECT fullname, email, type FROM ag_user WHERE email=?
    `, [email]);

    if (user[0].length > 0) {
      const response = await this.pool.query<RowDataPacket[]>(`
        SELECT email FROM ag_user WHERE email=? AND source=?
        `, [email, source]);
      
      if (response[0].length === 0) {
        return {
          response: 'source',
          user: null
        };
      }

      return {
        response: 'ok',
        user: user[0][0]
      };
    }

    return {
      response: 'register',
      user: null
    };
  }

  // validate google captcha code
  private async validateCaptcha(captcha: string) {
    return await lastValueFrom(this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.CAPTCHA_SECRET }&response=${ captcha }`));
  }

  private generateConfirmationToken = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const tokenLength = 12;
    let token = '';

    for (var i = 0; i <= tokenLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      token += chars.substring(randomNumber, randomNumber +1);
    }

    return token;
  }
}
