import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/users/entities/user.entity';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class MailService {
  private readonly appUrl: string;
  private readonly mailer: nodemailer.Transporter;
  private readonly confirmationTemplate: handlebars.TemplateDelegate;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.appUrl = this.configService.getOrThrow('APP_BASE_URL');
    this.confirmationTemplate = this.loadTemplate('confirmation.hbs');

    this.mailer = nodemailer.createTransport(
      {
        host: this.configService.getOrThrow('MAIL_HOST'),
        port: this.configService.getOrThrow<number>('MAIL_PORT'),
        secure: this.configService.getOrThrow<boolean>('MAIL_SECURE'),
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

  async sendUserConfirmation(user: UserEntity, token: string) {
    const url = `${this.appUrl}/api/v1/auth/signup/confirm?token=${token}`;
    const html = this.confirmationTemplate({name: user.login, url})

    await this.mailer.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
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