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

    async sendCommentInfo(comment: any) {
        await this.mailerService.sendMail({
            // to: 'agora@fenu.org',
            to: 'praimus666@gmail.com',
            subject: `${ comment.fullname } - ${ comment.subject }`,
            template: 'commentInfo',
            context: {
                comment,
            },
        });
    }

    async sendCocreation(form: any) {
        await this.mailerService.sendMail({
            // to: 'agora@fenu.org',
            to: 'praimus666@gmail.com',
            subject: `Co-create`,
            template: 'cocreation',
            context: {
                form,
            },
        });
    }
}
