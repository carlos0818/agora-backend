import { Inject, Injectable } from '@nestjs/common';

import { RowDataPacket, Pool } from 'mysql2/promise';

import { AgoraMessage } from './dto/agoraMessage.dto';
import { CloseAgoraMessage } from './dto/closeAgoraMessage.dto';
import { SaveUserPost } from './dto/saveUserPost';
import { CommentPost } from './dto/comment-post.dto';

@Injectable()
export class WallService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly pool: Pool,
  ){}

  async listAgoraMessages(agoraMessage: AgoraMessage) {
    const messages = await this.pool.query<RowDataPacket[]>(`
      SELECT h.index, h.title, h.body, h.link, h.effdt FROM ag_home_agora h
      WHERE h.effdt = (SELECT MAX(h_ed.effdt) FROM ag_home_agora h_ed WHERE h.index=h_ed.index AND h_ed.effdt <= current_timestamp)
      AND h.index NOT IN (SELECT nh.index FROM ag_home_agora_closed nh WHERE h.index=nh.index AND email=?)
      ORDER BY h.effdt
    `, [agoraMessage.email]);

    return messages[0];
  }

  async listUserPosts(agoraMessage: AgoraMessage) {
    const posts = await this.pool.query<RowDataPacket[]>(`
      select HU.\`index\`, Ntipo.type, Ntipo.companyName, U.fullname, Ntipo.profilepic, HU.body, DATE_FORMAT(HU.dateposted, '%Y-%m-%d %H:%i:%s') dateposted, case when Likes.likesC is not null then Likes.likesC else 0 end as likes, HU.indexparent
      from ag_home_user HU left outer join (select \`index\`, count(*) as likesC from ag_like group by \`index\`) as Likes on HU.\`index\`=Likes.\`index\`
      , ag_user U,
      (
      select email, 'Entrepreneur' as \`type\`, name as companyName, profilepic from ag_entrepreneur
      union
      select email, 'Investor' as \`type\`, name as companyName, profilepic from ag_investor
      union
      select email, 'Expert' as \`type\`, name as companyName, profilepic from ag_expert
      ) Ntipo
      where
      U.email=HU.email
      and U.qversion <> 0
      and (HU.email in (select emailcontact from ag_contact where status = 'A' and email = ?) or HU.email = ?)
      and Ntipo.email=HU.email
      order by HU.dateposted desc
    `, [agoraMessage.email, agoraMessage.email]);

    const postsOriginal = posts[0];
    let onlyPosts = [];
    const commentsArr = [];

    for (let i=0; i<postsOriginal.length; i++) {
      if (postsOriginal[i].indexparent) {
        commentsArr.push(postsOriginal[i]);
      } else {
        onlyPosts = [
          ...onlyPosts,
          {
            post: postsOriginal[i],
            comments: []
          }
        ]
      }
    }
   
    for (let i=0; i<commentsArr.length; i++) {
      for (let j=0; j<onlyPosts.length; j++) {
        if (onlyPosts[j].post.index === commentsArr[i].indexparent) {
          onlyPosts[j].comments.push(commentsArr[i]);
        }
      }
    }

    for (let i=0; i<onlyPosts.length; i++) {
      onlyPosts[i].comments.sort((a, b) => a.index - b.index);
    }

    return onlyPosts;
  }

  async closeAgoraMessage(closeAgoraMessage: CloseAgoraMessage) {
    await this.pool.query(`
      INSERT INTO ag_home_agora_closed VALUES(?,?)
    `, [closeAgoraMessage.email, closeAgoraMessage.index]);

    return 'Message closed';
  }

  async savePost(saveUserPost: SaveUserPost) {
    await this.pool.query(`
      INSERT INTO ag_home_user VALUES(NULL,?,?,NOW())
    `, [saveUserPost.email, saveUserPost.body]);

    return 'Post saved'
  }

  async saveCommentPost(commentPost: CommentPost) {
    await this.pool.query(`
      INSERT INTO ag_home_user VALUES(NULL, ?, ?, NOW(), ?)
    `, [commentPost.email, commentPost.body, commentPost.index]);

    return { message: 'Comment saved' };
  }
}
