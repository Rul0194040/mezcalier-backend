import { Controller, Body, Post, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDTO } from './email.dto';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { EmailSenderService } from '@mezcal/common/services/email-sender.service';

@Controller('browse/contact')
export class EmailController {
  /**
   * Servicios utilizados
   * @param EmailService
   * @param emailsenderservice
   */
  constructor(
    private readonly emailService: EmailService,
    private readonly emailsenderservice: EmailSenderService,
    private readonly configservice: ConfigService,
  ) {}
  private readonly logger = new Logger(EmailController.name);

  /**
   * Api: POST /api/v1/browse/contact/send
   *
   * @param {EmailDTO} email a crear.
   * @returns {void}
   */
  @Post('send')
  async save(@Body() email: EmailDTO): Promise<void> {
    const to = this.configservice.get<string>(ConfigKeys.EMAILS_INBOX);
    if (to) {
      const sendEmail: ISendMailOptions = {
        to: to,
        subject: 'Email desde Mezcalier',
        template: 'contact-email',
        context: {
          subject: email.subject,
          message: email.message,
          from: email.email,
          siteName: this.configservice.get<string>(ConfigKeys.SITE_NAME),
        },
      };
      await this.emailsenderservice.send(sendEmail);
    } else {
      this.logger.log('No esta configurada la clave EMAILS_INBOX en ENV');
    }
    return await this.emailService.save(email);
  }
}
