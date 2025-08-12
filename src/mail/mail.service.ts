import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/users/entities/user.entity';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class MailService {
  private readonly mailer: nodemailer.Transporter;
  private readonly confirmationTemplate: handlebars.TemplateDelegate;

  constructor(private readonly configService: ConfigService) {
    this.confirmationTemplate = this.loadTemplate('confirmation.hbs');

    this.mailer = nodemailer.createTransport(
      {
        host: this.configService.getOrThrow('MAIL_HOST'),
        port: this.configService.getOrThrow<number>('MAIL_PORT'),
        secure: this.configService.get<boolean>('MAIL_SECURE'),
        auth: {
          user: this.configService.getOrThrow('MAIL_USER'),
          pass: this.configService.getOrThrow('MAIL_PASSWORD'),
        },
      },
      {
        from: {
          name: 'No-reply',
          address: this.configService.getOrThrow('MAIL_FROM'),
        },
      },
    );
  }

  async sendUserConfirmation(user: UserEntity, code: string) {
    const html = this.confirmationTemplate({ name: user.login, code });

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Welcome to Our Events! Confirm your Email',
      html,
    });
  }


  private loadTemplate(name: string) {
    const tempFolder = join(__dirname, './templates');
    const tempPath = join(tempFolder, name);

    const source = readFileSync(tempPath, 'utf8');
    return handlebars.compile(source);
  }
}