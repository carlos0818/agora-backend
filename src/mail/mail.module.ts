import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer'; 
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { join } from 'path';

import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
        useFactory: async (config: ConfigService) => {
          return {
              transport: {
                host: config.get('MAIL_HOST'),
                secure: true,
                port: 465,
                auth: {
                  user: config.get('MAIL_USER'),
                  pass: config.get('MAIL_PASSWORD'),
                },
                tls: {
                  rejectUnauthorized: false,
                },
            },
            defaults: {
                from: `"${ config.get('MAIL_FROM_NAME') }" <${ config.get('MAIL_FROM') }>`,
            },
            template: {
                dir: join(__dirname, './templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                  strict: true,
                },
            },
          }
        },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
