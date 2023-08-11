import { Body, Controller, Get, Post, Query } from "@nestjs/common";

import { VoteService } from "../services/vote.service";
import { GetAverageVotesDto } from "../dto/get-average-votes.dto";
import { SaveVoteDto } from "../dto/save-vote.dto";
import { VerifyVoteDto } from "../dto/verify-vote.dto";

@Controller('vote')
export class VoteController {
    constructor(private readonly voteService: VoteService) {}

    @Get('get-average-votes')
    getAverageVotes(@Query() getAverageVotesDto: GetAverageVotesDto) {
        return this.voteService.getAverageVotes(getAverageVotesDto);
    }

    @Get('verify-vote')
    verifyVote(@Query() verifyVoteDto: VerifyVoteDto) {
        return this.voteService.verifyVote(verifyVoteDto);
    }

    @Post('user-vote')
    contactVote(@Body() saveVoteDto: SaveVoteDto) {
        return this.voteService.userVote(saveVoteDto);
    }
}