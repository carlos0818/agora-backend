import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { MailService } from 'src/mail/mail.service';
import { CreateCommentInfoDto } from './dto/create-comment-info.dto';

@Injectable()
export class CommentInfoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
  ){}

  async sendEmail(createCommentInfoDto: CreateCommentInfoDto) {
    const { data } = await this.validateCaptcha(createCommentInfoDto.captcha);
  
    if (!data.success) {
      throw new BadRequestException(`Incorrect captcha`);
    }

    await this.mailService.sendCommentInfo(createCommentInfoDto);

    return { message: 'Comment sent' };
  }

  private async validateCaptcha(captcha: string) {
    return await lastValueFrom(this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.CAPTCHA_SECRET }&response=${ captcha }`));
  }
}
