import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as Joi from 'joi';

import { DatabaseModule } from './database/database.module';
import { CountryModule } from './country/country.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';

import { environments } from './environments';
import { QuestionModule } from './question/question.module';
import { WallModule } from './wall/wall.module';
import config from './config';
// import { DatabaseService } from './database/database.service';
import { FilesModule } from './files/files.module';
import { EntrepreneurModule } from './entrepreneur/entrepreneur.module';
import { InvestorModule } from './investor/investor.module';
import { ExpertModule } from './expert/expert.module';
import { ContactModule } from './contact/contact.module';
import { UserCommentModule } from './user-comment/user-comment.module';
import { CommentInfoModule } from './comment-info/comment-info.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_NAME: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
      }),
    }),
    MailModule,
    DatabaseModule,
    CountryModule,
    UserModule,
    QuestionModule,
    WallModule,
    FilesModule,
    EntrepreneurModule,
    InvestorModule,
    ExpertModule,
    ContactModule,
    UserCommentModule,
    CommentInfoModule,
  ],
})
export class AppModule {}
