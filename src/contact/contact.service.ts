import { Inject, Injectable } from '@nestjs/common';

import { Pool } from 'mysql2/promise';

import { GetContactsByEmailDto } from './dto/get-contacts.dto';
import { DeleteContactDto } from './dto/delete-contact.dto';
import { ContactRequestsNotificationDto } from './dto/contact-requests-notification.dto';
import { ValidateFriendDto } from './dto/validate-friend.dto';
import { ContactVoteDto } from './dto/contact-vote.dto';

@Injectable()
export class ContactService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
  ){}

  async getContactsByEmail(getContactsByEmailDto: GetContactsByEmailDto) {
    let query = `
      select companyName, id, type, fullname, profilepic, email, phone, city, country, address, DATE_FORMAT(creationdate, '%b %Y') since from 
      (
      select U.id, X.name as companyName, 'Investor' as type, U.fullname, X.profilepic, X.email, X.phone, X.city, X.country, X.address, U.creationdate from ag_contact C, ag_investor X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='A'
      and X.name like ?
      UNION
      select U.id, X.name as companyName, 'Entrepreneur' as type, U.fullname, X.profilepic, X.email, X.phone, X.city, X.country, X.address, U.creationdate from ag_contact C, ag_entrepreneur X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='A'
      and X.name like ?
      UNION
      select U.id, X.name as companyName, 'Expert' as type, U.fullname, X.profilepic, X.email, X.phone, X.city, X.country, X.address, U.creationdate from ag_contact C, ag_expert X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='A'
      and X.name like ?
      ) ContactTBL
      order by 1
    `;
    let parameters = [];
    let term = '';
    
    if (getContactsByEmailDto.term && getContactsByEmailDto.term !== '') {
      term = `%${ getContactsByEmailDto.term }%`;
      parameters = [
        getContactsByEmailDto.email,
        term,
        getContactsByEmailDto.email,
        term,
        getContactsByEmailDto.email,
        term
      ];
    } else {
      parameters = [
        getContactsByEmailDto.email,
        '%',
        getContactsByEmailDto.email,
        '%',
        getContactsByEmailDto.email,
        '%'
      ];
    }

    const contacts = await this.pool.query(query, parameters);

    return contacts[0];
  }

  async getContactRequestsByEmail(getContactsByEmailDto: GetContactsByEmailDto) {
    let query = `
      select companyName, id, type, fullname, dateRequest, profilepic, email, phone, city, country, address, DATE_FORMAT(creationdate, '%b %Y') since from 
      (
      select U.id, X.name as companyName, 'Investor' as type, U.fullname, C.dateRequest, X.profilepic, X.email, X.phone, X.city, X.country, X.address, U.creationdate from ag_contact C, ag_investor X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='P'
      UNION
      select U.id, X.name as companyName, 'Entrepreneur' as type, U.fullname, C.dateRequest, X.profilepic, X.email, X.phone, X.city, X.country, X.address, U.creationdate from ag_contact C, ag_entrepreneur X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='P'
      UNION
      select U.id, X.name as companyName, 'Expert' as type, U.fullname, C.dateRequest, X.profilepic, X.email, X.phone, X.city, X.country, X.address, U.creationdate from ag_contact C, ag_expert X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='P'
      ) ContactTBL
      order by 1
    `;

    const contacts = await this.pool.query(query, [getContactsByEmailDto.email, getContactsByEmailDto.email, getContactsByEmailDto.email]);

    return contacts[0];
  }

  async deleteContact(deleteContactDto: DeleteContactDto) {
    const emailResp = await this.pool.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const email = emailResp[0][0].email;

    await this.pool.query(`
      delete from ag_contact where (email = ? and emailcontact=?) or (email = ? and emailcontact=?)
    `, [deleteContactDto.email, email, email, deleteContactDto.email]);

    return { message: 'Contact deleted' };
  }

  async acceptContact(deleteContactDto: DeleteContactDto) {
    const emailContactResp = await this.pool.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const emailContact = emailContactResp[0][0].email;

    await this.pool.query(`
      UPDATE ag_contact SET status='A' WHERE emailcontact=? AND email=?
    `, [emailContact, deleteContactDto.email]);

    await this.pool.query(`
      INSERT INTO ag_contact VALUES (?, 'A', ?, NOW(), NULL)
    `, [emailContact, deleteContactDto.email]);

    return { message: 'Contact accepted' };
  }

  async sendRequest(deleteContactDto: DeleteContactDto) {
    const emailContactResp = await this.pool.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const emailContact = emailContactResp[0][0].email;

    await this.pool.query(`
      INSERT INTO ag_contact VALUES (?, 'P', ?, NOW(), NULL)
    `, [emailContact, deleteContactDto.email]);
  }

  async checkSendRequest(deleteContactDto: DeleteContactDto) {
    const emailContactResp = await this.pool.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const emailContact = emailContactResp[0][0].email;
    
    const verifyResp = await this.pool.query(`
      SELECT COUNT(*) as count FROM ag_contact WHERE (email=? AND emailcontact=?) OR (email=? AND emailcontact=?)
    `, [emailContact, deleteContactDto.email, deleteContactDto.email, emailContact]);
    const verify = verifyResp[0][0].count;

    return { verify };
  }

  async getContactRequestsNotification(contactRequestsNotificationDto: ContactRequestsNotificationDto) {
    const emailContactResp = await this.pool.query(`
      select count(*) contactRequests from ag_contact where email=? and status='P'
    `, [contactRequestsNotificationDto.email]);
    const notification = emailContactResp[0][0];

    return notification;
  }

  async validateFriend(validateFriendDto: ValidateFriendDto) {
    const emailContactResp = await this.pool.query(`
      select COUNT(*) isFriend from ag_contact C, ag_user U
      where U.email=C.email and C.status='A' and C.emailcontact=? and id=?
    `, [validateFriendDto.email, validateFriendDto.id]);

    return emailContactResp[0][0];
  }

  async contactVote(contactVoteDto: ContactVoteDto) {
    const emailResp = await this.pool.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [contactVoteDto.id]);
    const email = emailResp[0][0].email;

    await this.pool.query(`
      INSERT INTO ag_vote VALUES(?,?,?)
    `, [email, contactVoteDto.email, contactVoteDto.vote]);

    return { message: 'Vote saved' };
  }
}
