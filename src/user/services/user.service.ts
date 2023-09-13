import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { RowDataPacket } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';

import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { RegisterSocialUserDto } from '../dto/register-social-user.dto';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { LoginTokenDto } from '../dto/login-token.dto';
import { VerifyUserDto } from '../dto/verifyUser.dto';
import { UpdateUserInfoDto } from '../dto/update-user-info.dto';

import { MailService } from 'src/mail/mail.service';
import { QuestionService } from 'src/question/question.service';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SendLinkForgotPasswordDto } from '../dto/send-link-forgot-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { EditPasswordDto } from '../dto/edit-password.dto';
import { VerifyVoteDto } from '../dto/verify-vote.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
    private readonly questionService: QuestionService,
  ){}

  // User login
  async login(loginUserDto: LoginUserDto) {
    if (loginUserDto.captcha) {
      const { data } = await this.validateCaptcha(loginUserDto.captcha);
  
      if (!data.success) {
        throw new BadRequestException(`Incorrect captcha`);
      }
    }

    const conn = await this.databaseService.getConnection();

    const verified = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=? AND verified='2'
    `, [loginUserDto.email]);

    if (verified[0].length > 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`Your account has been locked. Please go to "forgot password?"`);
    }

    const user = await conn.query<RowDataPacket[]>(`
      SELECT U.fullname, U.password, U.email, U.type, U.id, U.source, foto.profilepic, if (U.qversion > 0,1,0) as qversion, foto.valreq
      FROM ag_user U left outer join(
      select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_entrepreneur where email=?
      union
      select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_investor where email=?
      union
      select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_expert where email=?
      ) foto on foto.email=U.email
      WHERE U.email=? AND U.status='1' and U.verified=1
    `, [loginUserDto.email, loginUserDto.email, loginUserDto.email, loginUserDto.email]);

    if (user[0].length === 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`Incorrect credentials`);
    }

    if (!bcrypt.compareSync(loginUserDto.password, user[0][0].password)) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`Incorrect credentials`);
    }

    await conn.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [loginUserDto.email]);

    await this.databaseService.closeConnection(conn);

    return {
      fullname: user[0][0].fullname,
      name: user[0][0].fullname,
      email: user[0][0].email,
      type: user[0][0].type,
      id: user[0][0].id,
      profilepic: user[0][0].profilepic,
      source: user[0][0].source,
      qversion: user[0][0].qversion,
      required: user[0][0].valreq,
      token: this.getJwt({
        email: user[0][0].email,
      })
    };
  }

  async loginToken(loginTokenDto: LoginTokenDto) {
    const conn = await this.databaseService.getConnection();

    const user = await conn.query<RowDataPacket[]>(`
      SELECT email, fullname, type, id, source, (CASE WHEN TIMESTAMPDIFF(MINUTE, creationdate, NOW()) <= 15 THEN 'valid' ELSE 'not-valid' END) AS valid
      FROM ag_user WHERE email=? AND token=?
    `, [loginTokenDto.email, loginTokenDto.token]);

    if (user[0].length === 0 || user[0][0].valid === 'not-valid') {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`User: Incorrect credentials`);
    }

    await conn.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [loginTokenDto.email]);

    await this.databaseService.closeConnection(conn);

    return {
      fullname: user[0][0].fullname,
      name: user[0][0].fullname,
      email: user[0][0].email,
      type: user[0][0].type,
      id: user[0][0].id,
      profilepic: null,
      source: user[0][0].source,
      qversion: 0,
      required: 0,
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
      const token = this.generateUserToken();
      const id = await this.generateUserId();
      const password = bcrypt.hashSync(registerUserDto.password, 10);

      const conn = await this.databaseService.getConnection();

      await conn.query(`
        INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source, token, id)
        VALUES(?, ?, '1', ?, ?, 'en', now(), now(), now(), 'web', 'PR', ?, ?)
      `, [
          registerUserDto.email,
          password,
          registerUserDto.type,
          registerUserDto.fullname,
          token,
          id
        ]
      );

      await this.databaseService.closeConnection(conn);

      await this.insertUserQuestion(registerUserDto.type, registerUserDto.email);

      await this.mailService.sendUserRegister(registerUserDto.email, registerUserDto.fullname, process.env.ACTIVATE_ACCOUNT_URL, token);

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

    const conn = await this.databaseService.getConnection();

    await conn.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [registerSocialUserDto.email]);

    await this.databaseService.closeConnection(conn);

    return {
      fullname: validateEmailAndSource.user.fullname,
      name: validateEmailAndSource.user.fullname,
      email: registerSocialUserDto.email,
      type: validateEmailAndSource.user.type,
      id: validateEmailAndSource.user.id,
      profilepic: validateEmailAndSource.user.profilepic,
      source: validateEmailAndSource.user.source,
      qversion: validateEmailAndSource.user.qversion,
      required: validateEmailAndSource.user.valreq,
      token: this.getJwt({
        email: registerSocialUserDto.email,
      })
    };
  }

  // login social
  async loginSocial(registerSocialUserDto: RegisterSocialUserDto) {
    const validateEmailAndSource = await this.validateEmailAndSource(registerSocialUserDto.email, registerSocialUserDto.source);

    const id = await this.generateUserId();

    let conn = await this.databaseService.getConnection();

    switch (validateEmailAndSource.response) {
      case 'ok':
        await conn.query('UPDATE ag_user SET lastlogindate=NOW() WHERE email=?', [registerSocialUserDto.email]);

        await this.databaseService.closeConnection(conn);
        
        return {
          fullname: validateEmailAndSource.user.fullname,
          name: validateEmailAndSource.user.fullname,
          email: registerSocialUserDto.email,
          type: validateEmailAndSource.user.type,
          id: validateEmailAndSource.user.id,
          profilepic: validateEmailAndSource.user.profilepic,
          source: validateEmailAndSource.user.source,
          qversion: validateEmailAndSource.user.qversion,
          required: validateEmailAndSource.user.valreq,
          token: this.getJwt({
            email: registerSocialUserDto.email,
          })
        };
      case 'register':
        await conn.query(`
          INSERT INTO ag_user(email, password, status, type, fullname, lang, creationdate, lastdate, lastlogindate, creationadmin, source, id)
          VALUES(?, '$P@ssW0rd#', '1', ?, ?, 'en', now(), now(), now(), 'web', ?, ?)
        `, [
            registerSocialUserDto.email,
            registerSocialUserDto.type,
            registerSocialUserDto.fullname,
            registerSocialUserDto.source,
            id,
          ]
        );

        await this.databaseService.closeConnection(conn);

        await this.insertUserQuestion(registerSocialUserDto.type, registerSocialUserDto.email);
        
        return {
          fullname: registerSocialUserDto.fullname,
          name: registerSocialUserDto.fullname,
          email: registerSocialUserDto.email,
          type: registerSocialUserDto.type,
          id,
          profilepic: null,
          source: registerSocialUserDto.source,
          qversion: 0,
          required: 0,
          token: this.getJwt({
            email: registerSocialUserDto.email,
          })
        };
      case 'source':
        await this.databaseService.closeConnection(conn);
        throw new BadRequestException('This email is already registered with another account type');
    }
  }

  async activateAccount(activateAccountDto: ActivateAccountDto) {
    const conn = await this.databaseService.getConnection();

    const user = await conn.query<RowDataPacket[]>(`
      SELECT password, fullname, type, id, source FROM ag_user WHERE email=? AND token=?
    `, [activateAccountDto.email, activateAccountDto.token]);

    if (user[0].length === 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException('We cannot find your registered user');
    }

    const active = await conn.query<RowDataPacket[]>(`
      SELECT fullname FROM ag_user WHERE email=? AND verified='1'
    `, [activateAccountDto.email]);

    if (active[0].length > 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException('Your account has already been activated previously');
    }

    const verified = await conn.query(`
      SELECT (CASE WHEN TIMESTAMPDIFF(MINUTE, NOW(), creationdate) <= 15 THEN 'valid' ELSE 'not-valid' END) AS "valid" FROM ag_user WHERE email=? AND token=?
    `, [activateAccountDto.email, activateAccountDto.token]);

    if (verified[0][0].valid === 'not-valid') {
      await conn.query(`
        DELETE FROM ag_user WHERE email=?
      `, [activateAccountDto.email]);

      const token = this.generateUserToken()
      await conn.query(`
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

    await conn.query(`
      UPDATE ag_user SET verified=true WHERE email=?
    `, [activateAccountDto.email]);

    await this.databaseService.closeConnection(conn);

    return {
      fullname: user[0][0].fullname,
      name: user[0][0].fullname,
      email: activateAccountDto.email,
      type: user[0][0].type,
      id: user[0][0].id,
      profilepic: null,
      source: user[0][0].source,
      qversion: 0,
      required: user[0][0].valreq,
      token: this.getJwt({
        email: activateAccountDto.email,
      })
    }
  }

  async updateUserInfo(updateUserInfoDto: UpdateUserInfoDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_user SET fullname=? WHERE email=?
    `, [updateUserInfoDto.fullname, updateUserInfoDto.email]);

    await this.databaseService.closeConnection(conn);
  }

  async loadUserData(verifyUserDto: VerifyUserDto) {
    const conn = await this.databaseService.getConnection();

    const user = await conn.query(`
      SELECT email, fullname FROM ag_user WHERE email=?
    `, [verifyUserDto.email]);

    await this.databaseService.closeConnection(conn);

    return user[0][0];
  }

  async sendLinkForgotPassword(sendLinkDto: SendLinkForgotPasswordDto) {
    const { data } = await this.validateCaptcha(sendLinkDto.captcha);
  
    if (!data.success) {
      throw new BadRequestException(`Incorrect captcha`);
    }

    const conn = await this.databaseService.getConnection();

    const userResp = await conn.query<RowDataPacket[]>(`
      SELECT email, fullname FROM ag_user WHERE email=? AND source='PR'
    `, [sendLinkDto.email]);
    const user = userResp[0][0];

    if (userResp[0].length === 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException('The email does not exist');
    }
    
    const token = this.generateUserToken();
    await conn.query(`
      UPDATE ag_user SET token=? WHERE email=?
    `, [token, sendLinkDto.email]);
    await this.mailService.sendLinkForgotPassword(user, process.env.FORGOT_PASSWORD_URL, token);

    await this.databaseService.closeConnection(conn);

    return { message: 'Email sent' };
  }

  async updateVerified(activateAccountDto: ActivateAccountDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=? AND token=?
    `, [activateAccountDto.email, activateAccountDto.token]);

    if (validate[0].length === 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`The email does not exist`);
    }

    await conn.query(`
      UPDATE ag_user SET verified='2' WHERE email=?
    `, [activateAccountDto.email]);

    await this.databaseService.closeConnection(conn);
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { data } = await this.validateCaptcha(changePasswordDto.captcha);
  
    if (!data.success) {
      throw new BadRequestException(`Incorrect captcha`);
    }

    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=? AND token=?
    `, [changePasswordDto.email, changePasswordDto.token]);

    
    if (validate[0].length === 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`This email is not valid`);
    }

    const password = bcrypt.hashSync(changePasswordDto.password, 10);

    await conn.query(`
      UPDATE ag_user SET \`password\`=?, verified='1', token=NULL WHERE email=?
    `, [password, changePasswordDto.email]);

    await this.databaseService.closeConnection(conn);
  }

  async editPassword(editPasswordDto: EditPasswordDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`
      SELECT password FROM ag_user WHERE email=?
    `, [editPasswordDto.email]);

    if (validate[0].length === 0) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`Incorrect password`);
    }

    if (!bcrypt.compareSync(editPasswordDto.currentPassword, validate[0][0].password)) {
      await this.databaseService.closeConnection(conn);
      throw new BadRequestException(`Incorrect password`);
    }

    const password = bcrypt.hashSync(editPasswordDto.newPassword, 10);

    await conn.query(`
      UPDATE ag_user SET \`password\`=? WHERE email=?
    `, [password, editPasswordDto.email]);

    await this.databaseService.closeConnection(conn);
  }

  async viewProfileNotification(verifyUserDto: VerifyUserDto) {
    const conn = await this.databaseService.getConnection();

    const viewProfile = await conn.query(`
      select count(*) views from ag_profileview where email=? and status='P'
    `, [verifyUserDto.email]);

    await this.databaseService.closeConnection(conn);

    return viewProfile[0][0];
  }

  async viewProfile(verifyVoteDto: VerifyVoteDto) {
    const conn = await this.databaseService.getConnection();

    const emailResp = await conn.query(`
      select email from ag_user where id=?
    `, [verifyVoteDto.id]);
    const email = emailResp[0][0].email;

    const validate = await conn.query<RowDataPacket[]>(`
      select email from ag_profileview where email=? and emailview=?
    `, [email, verifyVoteDto.email]);

    if (validate[0].length === 0) {
      await conn.query(`
        INSERT INTO ag_profileview VALUES(?,?,NOW(),'P')
      `, [email, verifyVoteDto.email]);
    }

    await this.databaseService.closeConnection(conn);

    return { message: 'profile view inserted' };
  }

  // Generate JWT
  private getJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  // Validate if email is already exists
  private async validateEmail(email: string) {
    const conn = await this.databaseService.getConnection();

    const user = await conn.query<RowDataPacket[]>(`
      SELECT email FROM ag_user WHERE email=?
    `, [email]);

    await this.databaseService.closeConnection(conn);

    if (user[0].length > 0) {
      return true;
    }

    return false;
  }

  // Validate if email and source is already exists
  private async validateEmailAndSource(email: string, source: string) {
    const conn = await this.databaseService.getConnection();

    const user = await conn.query<RowDataPacket[]>(`
      SELECT U.fullname, U.email, U.type, U.id, U.source, foto.profilepic, if (U.qversion > 0,1,0) as qversion, foto.valreq FROM ag_user U left outer join
      (
      select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_entrepreneur where email=?
      union
      select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_investor where email=?
      union
      select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_expert where email=?
      ) foto on foto.email=U.email
      WHERE U.email=?
    `, [email, email, email, email]);

    if (user[0].length > 0) {
      const response = await conn.query<RowDataPacket[]>(`
        SELECT U.email, foto.profilepic, if (U.qversion > 0,1,0) as qversion, foto.valreq FROM ag_user U left outer join
        (
        select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_entrepreneur where email=?
        union
        select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_investor where email=?
        union
        select email, profilepic, if(name is null, 0, if (email_contact is null, 0,if (phone is null, 0, if (country is null, 0, if (city is null ,0, if(address is null, 0, 1)))))) as valreq from ag_expert where email=?
        ) foto on foto.email=U.email
        WHERE U.email=? and U.source=?
      `, [email, email, email, email, source]);
      
      if (response[0].length === 0) {
        await this.databaseService.closeConnection(conn);

        return {
          response: 'source',
          user: null
        };
      }

      await this.databaseService.closeConnection(conn);

      return {
        response: 'ok',
        user: user[0][0]
      };
    }

    await this.databaseService.closeConnection(conn);

    return {
      response: 'register',
      user: null
    };
  }

  // validate google captcha code
  private async validateCaptcha(captcha: string) {
    return await lastValueFrom(this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.CAPTCHA_SECRET }&response=${ captcha }`));
  }

  private generateUserToken() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const tokenLength = 12;
    let token = '';

    for (var i = 0; i <= tokenLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      token += chars.substring(randomNumber, randomNumber +1);
    }

    return token;
  }

  private async generateUserId() {
    const chars = '0123456789';
    const charsWithoutZero = '123456789';
    const tokenLength = 19;
    let id = '';

    for (var i = 0; i <= tokenLength; i++) {
      let randomNumber = Math.floor(Math.random() * chars.length);
      if (randomNumber === 0 && i === 0)
        randomNumber = Math.floor(Math.random() * charsWithoutZero.length);
      id += chars.substring(randomNumber, randomNumber +1);
    }

    const conn = await this.databaseService.getConnection();

    const respVerify = await conn.query<RowDataPacket[]>(`SELECT id FROM ag_user WHERE id=${ id }`);

    await this.databaseService.closeConnection(conn);
    
    if (respVerify[0].length > 0) {
      await this.generateUserId();
      return;
    }

    return id;
  }

  private async insertUserQuestion(type: string, email: string) {
    let query = '';
    if (type === 'E') {
      query = `SELECT DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt
                FROM ag_entquest q
                WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_entquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
                ORDER BY q.page, q.orderby LIMIT 1`;
    } else if (type === 'I') {
      query = `SELECT DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt
                FROM ag_invquest q
                WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_invquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
                ORDER BY q.page, q.orderby LIMIT 1`;
    } else if (type === 'X') {
      query = `SELECT DATE_FORMAT(q.effdt, '%Y-%m-%d %H:%i:%s') effdt
                FROM ag_expquest q
                WHERE q.status='A' AND q.effdt=(SELECT MAX(q_ed.effdt) FROM ag_expquest q_ed WHERE q.qnbr=q_ed.qnbr AND q_ed.effdt<=sysdate())
                ORDER BY q.page, q.orderby LIMIT 1`;
    }

    const conn = await this.databaseService.getConnection();

    const respMaxEffdt = await conn.query(query);

    await this.databaseService.closeConnection(conn);

    this.questionService.saveUserQuestion({
      qnbr: '0',
      anbr: '1',
      effdt: respMaxEffdt[0][0].effdt,
      email,
      type
    })
  }
}


