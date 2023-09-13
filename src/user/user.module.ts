import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

import { QuestionModule } from 'src/question/question.module';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { VoteController } from './controllers/vote.controller';
import { MessageController } from './controllers/message.controller';
import { HttpModule } from '@nestjs/axios';
import { MailService } from 'src/mail/mail.service';
import { VoteService } from './services/vote.service';
import { MessageService } from './services/message.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [UserController, VoteController, MessageController],
  providers: [UserService, VoteService, MessageService, JwtStrategy, MailService, DatabaseService],
  imports: [
    HttpModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log('JWT Secret', configService.get('JWT_SECRET'));
        // console.log('JWT SECRET', process.env.JWT_SECRET);
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '30d',
          },
        }
      }
    }),
    QuestionModule
  ],
  exports: [PassportModule, JwtStrategy, JwtModule],
})
export class UserModule {}
