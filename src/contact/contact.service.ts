import { Inject, Injectable } from '@nestjs/common';

import { Pool } from 'mysql2/promise';

import { GetContactsByEmailDto } from './dto/get-contacts.dto';
import { DeleteContactDto } from './dto/delete-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
  ){}

  async getContactsByEmail(getContactsByEmailDto: GetContactsByEmailDto) {
    let query = `
      select companyName, id, type, fullname, profilepic from 
      (
      select U.id, X.name as companyName, 'Investor' as type, U.fullname, X.profilepic from ag_contact C, ag_investor X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='A'
      and X.name like ?
      UNION
      select U.id, X.name as companyName, 'Entrepreneur' as type, U.fullname, X.profilepic from ag_contact C, ag_entrepreneur X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='A'
      and X.name like ?
      UNION
      select U.id, X.name as companyName, 'Expert' as type, U.fullname, X.profilepic from ag_contact C, ag_expert X, ag_user U
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
      select companyName, id, type, fullname, dateRequest, profilepic from 
      (
      select U.id, X.name as companyName, 'Investor' as type, U.fullname, C.dateRequest, X.profilepic from ag_contact C, ag_investor X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='P'
      UNION
      select U.id, X.name as companyName, 'Entrepreneur' as type, U.fullname, C.dateRequest, X.profilepic from ag_contact C, ag_entrepreneur X, ag_user U
      where 
      C.email=?
      and X.email=C.emailcontact
      and U.email=C.emailcontact
      and C.status='P'
      UNION
      select U.id, X.name as companyName, 'Expert' as type, U.fullname, C.dateRequest, X.profilepic from ag_contact C, ag_expert X, ag_user U
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
    await this.pool.query(`
      DELETE FROM ag_contact WHERE emailcontact=(SELECT email FROM ag_user WHERE id=?) AND email=?
    `, [deleteContactDto.id, deleteContactDto.email]);

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
      INSERT INTO ag_contact VALUES (?, 'P', ?, NOW(), NULL)
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
}
