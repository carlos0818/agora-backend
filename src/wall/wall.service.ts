import { Injectable } from '@nestjs/common';

import { InjectClient } from 'nest-mysql';
import { RowDataPacket } from 'mysql2';
import { Connection } from 'mysql2/promise';

import { AgoraMessage } from './dto/agoraMessage.dto';
import { CloseAgoraMessage } from './dto/closeAgoraMessage.dto';
import { SaveUserPost } from './dto/saveUserPost';

@Injectable()
export class WallService {
  constructor(
    @InjectClient('MySQL') private connection: Connection,
  ){}

  async listAgoraMessages(agoraMessage: AgoraMessage) {
    const messages = await this.connection.query<RowDataPacket[]>(`
      SELECT h.index, h.title, h.body, h.link, h.effdt FROM ag_home_agora h
      WHERE h.effdt = (SELECT MAX(h_ed.effdt) FROM ag_home_agora h_ed WHERE h.index=h_ed.index AND h_ed.effdt <= current_timestamp)
      AND h.index NOT IN (SELECT nh.index FROM ag_home_agora_closed nh WHERE h.index=nh.index AND email=?)
      ORDER BY h.effdt
    `, [agoraMessage.email]);

    return messages[0];
  }

  async listUserPosts() {
    const posts = await this.connection.query(`
      SELECT p.index, u.fullname, DATE_FORMAT(p.dateposted, '%d %b %Y %H:%i') dateposted, p.body FROM ag_home_user p, ag_user u 
      WHERE u.email=p.email
      ORDER BY p.dateposted
    `);

    return posts[0];
  }

  async closeAgoraMessage(closeAgoraMessage: CloseAgoraMessage) {
    await this.connection.query(`
      INSERT INTO ag_home_agora_closed VALUES(?,?)
    `, [closeAgoraMessage.email, closeAgoraMessage.index]);

    return 'Message closed';
  }

  async savePost(saveUserPost: SaveUserPost) {
    await this.connection.query(`
      INSERT INTO ag_home_user VALUES(NULL,?,?,NOW())
    `, [saveUserPost.email, saveUserPost.body]);

    return 'Post saved'
  }
}
