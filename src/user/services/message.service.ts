import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { GetUserMessagesDto } from '../dto/get-user-messages.dto';

@Injectable()
export class MessageService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
  ){}

  async getUserMessages(getUserMessages: GetUserMessagesDto) {
    const emailResp = await this.pool.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [getUserMessages.id]);
    const email = emailResp[0][0].email;

    const messages = await this.pool.query(`
      select I.index, I.emailcontact, Ntipo.profilepic, I.status, I.subject, I.body, DATE_FORMAT(dateAdded, '%Y-%m-%d %H%:%i') dateAdded,
      I.important, I.pitch, Ntipo.name companyName from ag_user_inbox I,
      (
      select email, name, profilepic from ag_entrepreneur
      union
      select email, name, profilepic from ag_investor
      union
      select email, name, profilepic from ag_expert
      ) Ntipo
      where 
      Ntipo.email=I.emailcontact
      and I.email=?
      and status in ('S','R')
    `, [email]);

      return messages[0];
  }
}
