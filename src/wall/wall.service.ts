import { Inject, Injectable } from '@nestjs/common';

// import { RowDataPacket } from 'mysql2';
import { RowDataPacket, Pool } from 'mysql2/promise';

import { AgoraMessage } from './dto/agoraMessage.dto';
import { CloseAgoraMessage } from './dto/closeAgoraMessage.dto';
import { SaveUserPost } from './dto/saveUserPost';
// import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class WallService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly pool: Pool,
    // private readonly databaseService: DatabaseService
  ){}

  async listAgoraMessages(agoraMessage: AgoraMessage) {
    // await this.databaseService.connect();
    // const connection = this.databaseService.getConnection();

    // const connection = await this.pool.getConnection();

    const messages = await this.pool.query<RowDataPacket[]>(`
      SELECT h.index, h.title, h.body, h.link, h.effdt FROM ag_home_agora h
      WHERE h.effdt = (SELECT MAX(h_ed.effdt) FROM ag_home_agora h_ed WHERE h.index=h_ed.index AND h_ed.effdt <= current_timestamp)
      AND h.index NOT IN (SELECT nh.index FROM ag_home_agora_closed nh WHERE h.index=nh.index AND email=?)
      ORDER BY h.effdt
    `, [agoraMessage.email]);

    // connection.release();

    // await this.databaseService.disconnect();

    return messages[0];
  }

  async listUserPosts() {
    // await this.databaseService.connect();
    // const connection = this.databaseService.getConnection();

    // const connection = await this.pool.getConnection();
    
    const posts = await this.pool.query(`
      SELECT p.index, u.fullname, DATE_FORMAT(p.dateposted, '%Y-%m-%d %H:%i:%s') dateposted, p.body FROM ag_home_user p, ag_user u 
      WHERE u.email=p.email
      ORDER BY p.dateposted DESC
    `);

    // connection.release();

    // await this.databaseService.disconnect();

    return posts[0];
  }

  async closeAgoraMessage(closeAgoraMessage: CloseAgoraMessage) {
    // await this.databaseService.connect();
    // const connection = this.databaseService.getConnection();

    // const connection = await this.pool.getConnection();

    await this.pool.query(`
      INSERT INTO ag_home_agora_closed VALUES(?,?)
    `, [closeAgoraMessage.email, closeAgoraMessage.index]);

    // connection.release();

    // await this.databaseService.disconnect();

    return 'Message closed';
  }

  async savePost(saveUserPost: SaveUserPost) {
    // await this.databaseService.connect();
    // const connection = this.databaseService.getConnection();

    // const connection = await this.pool.getConnection();

    await this.pool.query(`
      INSERT INTO ag_home_user VALUES(NULL,?,?,NOW())
    `, [saveUserPost.email, saveUserPost.body]);

    // connection.release();

    // await this.databaseService.disconnect();

    return 'Post saved'
  }
}
