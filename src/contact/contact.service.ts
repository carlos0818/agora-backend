import { Injectable } from '@nestjs/common';

import { GetContactsByEmailDto } from './dto/get-contacts.dto';
import { DeleteContactDto } from './dto/delete-contact.dto';
import { ContactRequestsNotificationDto } from './dto/contact-requests-notification.dto';
import { ValidateFriendDto } from './dto/validate-friend.dto';
import { SearchContactsDto } from './dto/search-contacts.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly databaseService: DatabaseService,
  ){}

  async getContactsByEmail(getContactsByEmailDto: GetContactsByEmailDto) {
    const conn = await this.databaseService.getConnection();

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

    const contacts = await conn.query(query, parameters);

    await this.databaseService.closeConnection(conn);

    return contacts[0];
  }

  async getContactRequestsByEmail(getContactsByEmailDto: GetContactsByEmailDto) {
    const conn = await this.databaseService.getConnection();

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

    const contacts = await conn.query(query, [getContactsByEmailDto.email, getContactsByEmailDto.email, getContactsByEmailDto.email]);

    await this.databaseService.closeConnection(conn);

    return contacts[0];
  }

  async deleteContact(deleteContactDto: DeleteContactDto) {
    const conn = await this.databaseService.getConnection();

    const emailResp = await conn.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const email = emailResp[0][0].email;

    await conn.query(`
      delete from ag_contact where (email = ? and emailcontact=?) or (email = ? and emailcontact=?)
    `, [deleteContactDto.email, email, email, deleteContactDto.email]);

    await this.databaseService.closeConnection(conn);

    return { message: 'Contact deleted' };
  }

  async acceptContact(deleteContactDto: DeleteContactDto) {
    const conn = await this.databaseService.getConnection();

    const emailContactResp = await conn.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const emailContact = emailContactResp[0][0].email;

    await conn.query(`
      UPDATE ag_contact SET status='A' WHERE emailcontact=? AND email=?
    `, [emailContact, deleteContactDto.email]);

    await conn.query(`
      INSERT INTO ag_contact VALUES (?, 'A', ?, NOW(), NULL)
    `, [emailContact, deleteContactDto.email]);

    await this.databaseService.closeConnection(conn);

    return { message: 'Contact accepted' };
  }

  async sendRequest(deleteContactDto: DeleteContactDto) {
    const conn = await this.databaseService.getConnection();

    const emailContactResp = await conn.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const emailContact = emailContactResp[0][0].email;

    await conn.query(`
      INSERT INTO ag_contact VALUES (?, 'P', ?, NOW(), NULL)
    `, [emailContact, deleteContactDto.email]);

    await this.databaseService.closeConnection(conn);
  }

  async checkSendRequest(deleteContactDto: DeleteContactDto) {
    const conn = await this.databaseService.getConnection();

    const emailContactResp = await conn.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [deleteContactDto.id]);
    const emailContact = emailContactResp[0][0].email;
    
    const verifyResp = await conn.query(`
      SELECT COUNT(*) as count FROM ag_contact WHERE (email=? AND emailcontact=?) OR (email=? AND emailcontact=?)
    `, [emailContact, deleteContactDto.email, deleteContactDto.email, emailContact]);
    const verify = verifyResp[0][0].count;

    await this.databaseService.closeConnection(conn);

    return { verify };
  }

  async getContactRequestsNotification(contactRequestsNotificationDto: ContactRequestsNotificationDto) {
    const conn = await this.databaseService.getConnection();

    const emailContactResp = await conn.query(`
      select count(*) contactRequests from ag_contact where email=? and status='P'
    `, [contactRequestsNotificationDto.email]);
    const notification = emailContactResp[0][0];

    await this.databaseService.closeConnection(conn);

    return notification;
  }

  async validateFriend(validateFriendDto: ValidateFriendDto) {
    const conn = await this.databaseService.getConnection();

    const emailContactResp = await conn.query(`
      select COUNT(*) isFriend from ag_contact C, ag_user U
      where U.email=C.email and C.status='A' and C.emailcontact=? and id=?
    `, [validateFriendDto.email, validateFriendDto.id]);

    await this.databaseService.closeConnection(conn);

    return emailContactResp[0][0];
  }

  async searchContact(searchContactsDto: SearchContactsDto) {
    const conn = await this.databaseService.getConnection();

    const contactsResp = await conn.query(`
      select Ntipo.name as companyName, Ntipo.email, Ntipo.profilepic, U.fullname, U.id from 
      (
      select email, 'Entrepreneur' as tipo, name, profilepic from ag_entrepreneur
      union
      select email, 'Investor' as tipo, name, profilepic from ag_investor
      union
      select email, 'Expert' as tipo, name, profilepic from ag_expert
      ) Ntipo, ag_user U
      where 
      U.email = Ntipo.email
      and Ntipo.email in (select emailcontact from ag_contact where email=? and status='A')
    `, [searchContactsDto.email]);

    await this.databaseService.closeConnection(conn);

    return contactsResp[0];
  }
}
