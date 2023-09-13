import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RowDataPacket } from 'mysql2/promise';

import { MailService } from 'src/mail/mail.service';
import { DatabaseService } from 'src/database/database.service';
import { CreateCommentInfoDto } from './dto/create-comment-info.dto';
import { CocreationDto } from './dto/cocreation.dto';

@Injectable()
export class CommentInfoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
    private readonly databaseService: DatabaseService,
  ){}

  async sendEmail(createCommentInfoDto: CreateCommentInfoDto) {
    const { data } = await this.validateCaptcha(createCommentInfoDto.captcha);
  
    if (!data.success) {
      throw new BadRequestException(`Incorrect captcha`);
    }

    await this.mailService.sendCommentInfo(createCommentInfoDto);

    return { message: 'Comment sent' };
  }

  async sendCocreation(cocreationDto: CocreationDto) {
    const { data } = await this.validateCaptcha(cocreationDto.captcha);
  
    if (!data.success) {
      throw new BadRequestException(`Incorrect captcha`);
    }

    await this.mailService.sendCocreation(cocreationDto);

    return { message: 'Cocreation sent' };
  }

  async getHub() {
    const conn = await this.databaseService.getConnection();

    const hubResp = await conn.query<RowDataPacket[]>(`
      select l0.name title, l1.name level1, l2.name level2, l3.body from ag_hub l0, ag_hub l1, ag_hub l2, ag_hub l3
      where 
      l0.lvl=1
      and l1.lvl=2
      and l2.lvl=3
      and l3.lvl=4
      and l0.nbr=l1.parent
      and l1.nbr=l2.parent
      and l2.nbr=l3.parent
      order by l0.nbr, l1.nbr, l2.nbr, l3.nbr
    `);

    await this.databaseService.closeConnection(conn);

    let mainArray = [];

    for (let i=0; i<hubResp[0].length; i++) {
      mainArray.push({
        title: hubResp[0][i].title,
        level1: [],
      });
    }

    const uniqueTitles = [];
    const unique = mainArray.filter(element => {
      const isDuplicate = uniqueTitles.includes(element.title);
    
      if (!isDuplicate) {
        uniqueTitles.push(element.title);
    
        return true;
      }

      return false;
    });

    for (let i=0; i<unique.length; i++) {
      for (let j=0; j<hubResp[0].length; j++) {
        if (unique[i].title === hubResp[0][j].title) {
          const find = unique[i].level1.find((lvl1: any) => {
            if (lvl1.name === hubResp[0][j].level1)
              return true

            return false
          })
          
          if (!find) {
            unique[i].level1.push({
              name: hubResp[0][j].level1,
              level2: []
            });
          }
        }
      }
    }

    for (let i=0; i<unique.length; i++) {
      for (let j=0; j<hubResp[0].length; j++) {
        if (unique[i].title === hubResp[0][j].title) {
          for (let k=0; k<unique[i].level1.length; k++) {
            if (unique[i].level1[k].name === hubResp[0][j].level1) {
              const find = unique[i].level1[k].level2.find((lvl2: any) => {
                if (lvl2.name === hubResp[0][j].level2)
                  return true
    
                return false
              })

              if (!find) {
                unique[i].level1[k].level2.push({
                  name: hubResp[0][j].level2,
                  body: hubResp[0][j].body
                })
              }
            }
          }
        }
      }
    }

    return unique;
  }

  private async validateCaptcha(captcha: string) {
    return await lastValueFrom(this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.CAPTCHA_SECRET }&response=${ captcha }`));
  }
}
