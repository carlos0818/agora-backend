import { Injectable } from '@nestjs/common';

import { GetUserMessagesDto } from '../dto/get-user-messages.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { DeleteMessageDto } from '../dto/delete-message.dto';
import { VerifyUserDto } from '../dto/verifyUser.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly databaseService: DatabaseService,
  ){}

  async getUserMessages(getUserMessages: GetUserMessagesDto) {
    const conn = await this.databaseService.getConnection();

    const emailResp = await conn.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [getUserMessages.id]);
    const email = emailResp[0][0].email;

    const messages = await conn.query(`
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

    await this.databaseService.closeConnection(conn);

      return messages[0];
  }

  async sendMessage(sendMessageDto: SendMessageDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
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

    await this.databaseService.closeConnection(conn);

    return { message: 'Message sent' };
  }

  async deleteMessage(deleteMessageDto: DeleteMessageDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_user_inbox SET status='D' WHERE \`index\`=?
    `, [deleteMessageDto.index]);

    await this.databaseService.closeConnection(conn);

    return { message: 'Message deleted' };
  }

  async getMessagesNotification(verifyUserDto: VerifyUserDto) {
    const conn = await this.databaseService.getConnection();

    const notificationResp = await conn.query(`
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

    await this.databaseService.closeConnection(conn);

    return notificationResp[0][0];
  }

  async readMessage(deleteMessageDto: DeleteMessageDto) {
    const conn = await this.databaseService.getConnection();

    const notificationResp = await conn.query(`
      UPDATE ag_user_inbox SET \`status\`='R' WHERE \`index\`=?
    `, [deleteMessageDto.index]);

    await this.databaseService.closeConnection(conn);

    return notificationResp[0][0];
  }
}
