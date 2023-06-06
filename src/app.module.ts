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
  ],
})
export class AppModule {}
