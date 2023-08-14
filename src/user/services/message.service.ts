import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

import { GetUserMessagesDto } from '../dto/get-user-messages.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { DeleteMessageDto } from '../dto/delete-message.dto';
import { VerifyUserDto } from '../dto/verifyUser.dto';

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
      select CONVERT(I.index, CHAR(40)) \`index\`, I.emailcontact, Ntipo.profilepic, I.status, I.subject, I.body, DATE_FORMAT(dateAdded, '%Y-%m-%d %H%:%i') dateAdded,
      I.important, I.pitch, Ntipo.name companyName, U.fullname from ag_user_inbox I, ag_user U,
      (
      select email, name, profilepic from ag_entrepreneur
      union
      select email, name, profilepic from ag_investor
      union
      select email, name, profilepic from ag_expert
      ) Ntipo
      where 
      Ntipo.email=I.emailcontact
      and U.email=I.emailcontact
      and I.email=?
      and I.status in ('S','R')
      order by dateAdded desc
    `, [email]);

      return messages[0];
  }

  async sendMessage(sendMessageDto: SendMessageDto) {
    await this.pool.query(`
      INSERT INTO ag_user_inbox VALUES(NULL,?,?,?,?,?, NOW(),?,?)
    `, [
      sendMessageDto.email,
      sendMessageDto.emailcontact,
      sendMessageDto.status,
      sendMessageDto.subject,
      sendMessageDto.body,
      sendMessageDto.important,
      sendMessageDto.pitch
    ]);

    return { message: 'Message sent' };
  }

  async deleteMessage(deleteMessageDto: DeleteMessageDto) {
    await this.pool.query(`
      UPDATE ag_user_inbox SET status='D' WHERE \`index\`=?
    `, [deleteMessageDto.index]);

    return { message: 'Message deleted' };
  }

  async getMessagesNotification(verifyUserDto: VerifyUserDto) {
    const notificationResp = await this.pool.query(`
      select count(*) messages from ag_user_inbox I,
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
      and status='S'
      order by dateAdded desc
    `, [verifyUserDto.email]);

    return notificationResp[0][0];
  }

  async readMessage(deleteMessageDto: DeleteMessageDto) {
    const notificationResp = await this.pool.query(`
      UPDATE ag_user_inbox SET \`status\`='R' WHERE \`index\`=?
    `, [deleteMessageDto.index]);

    return notificationResp[0][0];
  }
}
