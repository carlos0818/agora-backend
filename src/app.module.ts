import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';

import { DatabaseModule } from './database/database.module';
import { CountryModule } from './country/country.module';

import { environments } from './environments';
import { UserModule } from './user/user.module';
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
    DatabaseModule,
    CountryModule,
    UserModule,
  ],
})
export class AppModule {}
