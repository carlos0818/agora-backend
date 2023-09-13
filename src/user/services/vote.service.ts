import { Injectable } from "@nestjs/common";

import { GetAverageVotesDto } from "../dto/get-average-votes.dto";
import { SaveVoteDto } from "../dto/save-vote.dto";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class VoteService {
    constructor(
      private readonly databaseService: DatabaseService,
    ){}

    async getAverageVotes(getAverageVotesDto: GetAverageVotesDto) {
      const conn = await this.databaseService.getConnection();

      const average = await conn.query(`
        select (case when round(AVG(V.vote),0) is null then 0 else round(AVG(V.vote),0) end) average
        from ag_vote V, ag_user U where V.email=U.email and U.id=?
      `, [getAverageVotesDto.id]);

      await this.databaseService.closeConnection(conn);

      return average[0][0];
    }

    async userVote(saveVoteDto: SaveVoteDto) {
      const conn = await this.databaseService.getConnection();

      const emailResp = await conn.query(`
        SELECT email FROM ag_user WHERE id=?
      `, [saveVoteDto.id]);
      const email = emailResp[0][0].email;

      await conn.query(`
        DELETE FROM ag_vote WHERE email=? AND emailvote=?
      `, [email, saveVoteDto.email]);
  
      await conn.query(`
        INSERT INTO ag_vote VALUES(?,?,?)
      `, [email, saveVoteDto.email, saveVoteDto.vote]);

      await this.databaseService.closeConnection(conn);
  
      return { message: 'Vote saved' };
    }
}