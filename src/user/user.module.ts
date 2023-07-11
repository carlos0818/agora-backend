import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MailService } from 'src/mail/mail.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy, MailService, DatabaseService],
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
    })
  ],
  exports: [PassportModule, JwtStrategy, JwtModule],
})
export class UserModule {}
