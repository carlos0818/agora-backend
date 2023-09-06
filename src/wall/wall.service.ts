import { Inject, Injectable } from '@nestjs/common';

import { RowDataPacket, Pool } from 'mysql2/promise';

import { AgoraMessage } from './dto/agoraMessage.dto';
import { CloseAgoraMessage } from './dto/closeAgoraMessage.dto';
import { SaveUserPostDto } from './dto/saveUserPost';
import { CommentPost } from './dto/comment-post.dto';
import { SaveLikeDto } from './dto/save-like.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class WallService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly pool: Pool,
    private readonly databaseService: DatabaseService,
  ){}

  async listAgoraMessages(agoraMessage: AgoraMessage) {
    // const conn = await this.databaseService.getConnection();
    // const messages = await conn.query(`
    //   SELECT h.index, h.title, h.body, h.link, h.effdt FROM ag_home_agora h
    //   WHERE h.effdt = (SELECT MAX(h_ed.effdt) FROM ag_home_agora h_ed WHERE h.index=h_ed.index AND h_ed.effdt <= current_timestamp)
    //   AND h.index NOT IN (SELECT nh.index FROM ag_home_agora_closed nh WHERE h.index=nh.index AND email=?)
    //   ORDER BY h.effdt
    // `, [agoraMessage.email]);
    // await this.databaseService.closeConnection(conn);

    const messages = await this.pool.query<RowDataPacket[]>(`
      SELECT h.index, h.title, h.body, h.link, h.effdt FROM ag_home_agora h
      WHERE h.effdt = (SELECT MAX(h_ed.effdt) FROM ag_home_agora h_ed WHERE h.index=h_ed.index AND h_ed.effdt <= current_timestamp)
      AND h.index NOT IN (SELECT nh.index FROM ag_home_agora_closed nh WHERE h.index=nh.index AND email=?)
      ORDER BY h.effdt
    `, [agoraMessage.email]);

    return messages[0];
  }

  async listUserPosts(agoraMessage: AgoraMessage) {
    const indexesResp = await this.pool.query<RowDataPacket[]>(`
      select \`index\` from ag_like where email=?
    `, [agoraMessage.email]);
    const indexes = indexesResp[0];

    const posts = await this.pool.query<RowDataPacket[]>(`
      select HU.\`index\`, Ntipo.type, Ntipo.companyName, U.fullname, U.id userId, Ntipo.profilepic, HU.body, DATE_FORMAT(HU.dateposted, '%Y-%m-%d %H:%i:%s') dateposted, case when Likes.likesC is not null then Likes.likesC else 0 end as likes, HU.indexparent
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
      and (HU.email in (select emailcontact from ag_contact where status = 'A' and email=?) or (HU.email=? or HU.indexparent in (select distinct indexparent from ag_home_user where email=? and indexparent is not null)))
      and Ntipo.email=HU.email
      order by HU.dateposted desc
    `, [agoraMessage.email, agoraMessage.email, agoraMessage.email]);

    const postsOriginal = posts[0];
    let onlyPosts = [];
    const commentsArr = [];
    const indexesArr = [];

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

    for (let i=0; i<indexes.length; i++) {
      indexesArr.push(indexes[i].index);
    }

    for (let i=0; i<onlyPosts.length; i++) {
      onlyPosts[i].like = false;
      for (let j=0; j<onlyPosts[i].comments.length; j++) {
        onlyPosts[i].comments[j].like = false;
      }
    }

    for (let i=0; i<indexesArr.length; i++) {
      for (let j=0; j<onlyPosts.length; j++) {
        if (indexesArr[i] === onlyPosts[j].post.index) {
          onlyPosts[j].like = true;
        }

        if (onlyPosts[j].comments.length > 0) {
          let count1 = -1;
          for (let k=0; k<onlyPosts[j].comments.length; k++) {
            if (indexesArr[i] === onlyPosts[j].comments[k].index) {
              count1 = k;
            }
          }
          if (count1 > -1) {
            onlyPosts[j].comments[count1].like = true;
          }
        }
      }
    }

    return onlyPosts;
  }

  async closeAgoraMessage(closeAgoraMessage: CloseAgoraMessage) {
    await this.pool.query(`
      INSERT INTO ag_home_agora_closed VALUES(?,?)
    `, [closeAgoraMessage.email, closeAgoraMessage.index]);

    return 'Message closed';
  }

  async savePost(saveUserPost: SaveUserPostDto) {
    await this.pool.query(`
      INSERT INTO ag_home_user VALUES(NULL,?,?,NOW(),NULL)
    `, [saveUserPost.email, saveUserPost.body]);

    return 'Post saved'
  }

  async saveCommentPost(commentPost: CommentPost) {
    await this.pool.query(`
      INSERT INTO ag_home_user VALUES(NULL,?,?,NOW(),?)
    `, [commentPost.email, commentPost.body, commentPost.index]);

    return { message: 'Comment saved' };
  }

  async saveLikePost(saveLikeDto: SaveLikeDto) {
    const verifyResp = await this.pool.query(`
      SELECT COUNT(*) verify FROM ag_like WHERE \`index\`=? AND email=?
    `, [saveLikeDto.index, saveLikeDto.email]);
    const verify = verifyResp[0][0].verify;

    if (verify === 0) {
      await this.pool.query(`
        INSERT INTO ag_like VALUES(?,?)
      `, [saveLikeDto.index, saveLikeDto.email]);
    } else {
      await this.pool.query(`
        DELETE FROM ag_like WHERE \`index\`=? AND email=?
      `, [saveLikeDto.index, saveLikeDto.email]);
    }
  }
}
