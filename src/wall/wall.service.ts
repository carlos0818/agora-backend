import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class WallService {
  constructor(
    @Inject('Postgres') private clientPg: Client,
  ){}

  async listAgoraMessages(email: string) {
    const questions = await this.clientPg.query(`
      SELECT h.index, h.title, h.body, h.link, h.effdt FROM ag_home_agora h
      WHERE h.effdt = (SELECT MAX(h_ed.effdt) FROM ag_home_agora h_ed WHERE h.index=h_ed.index AND h_ed.effdt <= current_timestamp)
      AND h.index NOT IN (SELECT nh.index FROM ag_home_agora_closed nh WHERE h.index=nh.index AND email=$1)
      ORDER BY h.effdt
    `, [email]);

    return questions.rows;
  }

}
