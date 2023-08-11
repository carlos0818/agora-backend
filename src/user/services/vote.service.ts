import { Inject, Injectable } from "@nestjs/common";
import { Pool } from "mysql2/promise";
import { GetAverageVotesDto } from "../dto/get-average-votes.dto";
import { SaveVoteDto } from "../dto/save-vote.dto";
import { VerifyVoteDto } from "../dto/verify-vote.dto";

@Injectable()
export class VoteService {
    constructor(
        @Inject('DATABASE_CONNECTION') private pool: Pool,
    ){}

    async getAverageVotes(getAverageVotesDto: GetAverageVotesDto) {
        const average = await this.pool.query(`
            select round(AVG(V.vote),0) average from ag_vote V, ag_user U where V.email=U.email and U.id=?
        `, [getAverageVotesDto.id]);

        return average[0][0];
    }

    async verifyVote(verifyVoteDto: VerifyVoteDto) {
        const verify = await this.pool.query(`
        select COUNT(*) resp from ag_vote V, ag_user U where V.email=U.email
        and V.emailvote=? and U.id=?;
        `, [verifyVoteDto.email, verifyVoteDto.id]);

        return verify[0][0];
    }

    async userVote(saveVoteDto: SaveVoteDto) {
        const emailResp = await this.pool.query(`
          SELECT email FROM ag_user WHERE id=?
        `, [saveVoteDto.id]);
        const email = emailResp[0][0].email;
    
        await this.pool.query(`
          INSERT INTO ag_vote VALUES(?,?,?)
        `, [email, saveVoteDto.email, saveVoteDto.vote]);
    
        return { message: 'Vote saved' };
    }
}