import { Inject, Injectable } from '@nestjs/common';

import { Pool } from 'mysql2/promise';

import { GetContactsByEmailDto } from './dto/get-contacts.dto';

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
}
