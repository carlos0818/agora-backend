import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserRegister(email: string, password: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Agora user',
            template: 'newUser',
            context: {
                email,
                password,
            },
        });
    }
}
