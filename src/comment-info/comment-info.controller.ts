import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommentInfoService } from './comment-info.service';
import { CreateCommentInfoDto } from './dto/create-comment-info.dto';
import { CocreationDto } from './dto/cocreation.dto';

@Controller('comment-info')
export class CommentInfoController {
  constructor(private readonly commentInfoService: CommentInfoService) {}

  @Post('send-email')
  sendEmail(@Body() createCommentInfoDto: CreateCommentInfoDto) {
    return this.commentInfoService.sendEmail(createCommentInfoDto);
  }

  @Post('send-cocreation')
  sendCoCreation(@Body() cocreationDto: CocreationDto) {
    return this.commentInfoService.sendCocreation(cocreationDto);
  }

  @Get('get-hub')
  getHub() {
    return this.commentInfoService.getHub();
  }
}
