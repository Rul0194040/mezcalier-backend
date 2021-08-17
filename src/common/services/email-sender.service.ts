import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';

/**
 * Servicio para envio de corre, solo enviar lo necesario.
 *
 */
@Injectable()
export class EmailSenderService {
  /**
   * @ignore
   */
  constructor(
    private readonly _loggerService: MyLogger,
    private readonly _mailerService: MailerService,
    private readonly _configService: ConfigService,
  ) {}

  /**
   * Envio de email
   * @param email opciones de email
   */
  send(email: ISendMailOptions): void {
    const SMTP_USER = this._configService.get<string>(ConfigKeys.SMTP_USER);
    const SMTP_PASSWORD = this._configService.get<string>(
      ConfigKeys.SMTP_PASSWORD,
    );
    const SMTP_HOST = this._configService.get<string>(ConfigKeys.SMTP_HOST);
    const SMTP_FROM_EMAIL = this._configService.get<string>(
      ConfigKeys.SMTP_FROM_EMAIL,
    );

    if (SMTP_USER && SMTP_PASSWORD && SMTP_HOST && SMTP_FROM_EMAIL) {
      this._mailerService
        .sendMail(email)
        .then((result) => {
          this._loggerService.info(`Email sent: ${JSON.stringify(result)}`);
        })
        .catch((error) => {
          console.log('error al enviar email', error);
          this._loggerService.error(error.message, error.trace);
        });
    } else {
      this._loggerService.warn(
        'Email service not configured, please check your env vars',
      );
    }
  }
}
