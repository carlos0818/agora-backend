import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserRegister(email: string, fullname: string, url: string, token: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome to Agora - Your Impactful Collaboration Platform',
            template: 'newUser',
            context: {
                email,
                fullname,
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

    async sendCommentInfo(comment: any) {
        await this.mailerService.sendMail({
            // to: 'agora.admin@uncdf.org',
            to: 'praimus666@gmail.com',
            subject: 'Your Message to Agora Team',
            template: 'commentInfo',
            context: {
                comment,
            },
        });
    }

    async sendCocreation(form: any) {
        await this.mailerService.sendMail({
            to: 'agora.admin@uncdf.org',
            // to: 'praimus666@gmail.com',
            subject: `Co-create`,
            template: 'cocreation',
            context: {
                form,
            },
        });
    }
}
