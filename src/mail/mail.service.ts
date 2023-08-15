import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserRegister(email: string, url: string, token: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Agora user',
            template: 'newUser',
            context: {
                email,
                url,
                token
            },
        });
    }

    async sendLinkForgotPassword(user: any, url: string, token: string) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Agora Password Reset',
            template: 'forgotPassword',
            context: {
                user,
                url,
                token
            },
        });
    }
}
