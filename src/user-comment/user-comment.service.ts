import { Inject, Injectable } from '@nestjs/common';

import { Pool } from 'mysql2/promise';

import { GetUserCommentDto } from './dto/get-user-comment.dto';
import { SaveUserCommentDto } from './dto/save-user-comment.dto';

@Injectable()
export class UserCommentService {
  constructor(
    @Inject('DATABASE_CONNECTION') private pool: Pool,
  ){}

  async getUserComments(getUserCommentDto: GetUserCommentDto) {
    const comments = await this.pool.query(`
      select CU.index, Ntipo.tipo, Ntipo.name, U2.fullname, Ntipo.profilepic, CU.body, DATE_FORMAT(CU.dateAdded, '%Y-%m-%d %H:%i') dateAdded, U2.email, U2.id
      from ag_user_comment CU, ag_user U, ag_user U2,
      (
      select email, 'Entrepreneur' as tipo, name, profilepic from ag_entrepreneur
      union
      select email, 'Investor' as tipo, name, profilepic from ag_investor
      union
      select email, 'Expert' as tipo, name, profilepic from ag_expert
      ) Ntipo
      where
      U.email=CU.email
      and Ntipo.email=CU.emailcontact
      and U2.email=CU.emailcontact
      and U.qversion <> 0
      and U.id=?
      order by CU.dateAdded desc
    `, [getUserCommentDto.id]);
    
    return comments[0];
  }

  async saveUserComment(saveUserCommentDto: SaveUserCommentDto) {
    const emailResp = await this.pool.query(`
      SELECT email FROM ag_user WHERE id=?
    `, [saveUserCommentDto.userId]);
    const email = emailResp[0][0].email;

    await this.pool.query(`
      INSERT INTO ag_user_comment VALUES(NULL,?,?,?,NOW())
    `, [email, saveUserCommentDto.email, saveUserCommentDto.body]);
    
    return { message: 'Comment saved' };
  }
}
