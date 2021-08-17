import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { MyLogger } from '@mezcal/common/services/logger.service';
/**
 * Intento de enviar SMSs con twilio
 */
@Injectable()
export class SmsService {
  /**
   * Requeridos
   *
   * @param _configService
   * @param _logService
   */
  constructor(
    private readonly _configService: ConfigService,
    private readonly _logService: MyLogger,
  ) {}
  /**
   * Cliente instanciado para el envio, es de tipo Twilio o false segun las variables .env
   */
  private readonly client =
    this._configService.get<string>(ConfigKeys.TWILIO_ID) &&
    this._configService.get<string>(ConfigKeys.TWILIO_KEY) &&
    this._configService.get<string>(ConfigKeys.TWILIO_NUMBER)
      ? Twilio(
          this._configService.get<string>(ConfigKeys.TWILIO_ID),
          this._configService.get<string>(ConfigKeys.TWILIO_KEY),
        )
      : false;
  /**
   * Enviar un mensaje!
   *
   * @param num Numero de telefono incluido codigo de area internacional ej: +529510001234
   * @param message el mensaje de texto
   */
  send(num: string, message: string): void {
    this._logService.info(`Sending sms: ${num}, ${message}...`);
    if (this.client && this.client['messages']) {
      this.client['messages']
        .create({
          body: message,
          from: this._configService.get<string>(ConfigKeys.TWILIO_NUMBER),
          to: num,
        })
        .then((messageSent) => {
          this._logService.info(`SMS sent: ${messageSent.sid}`);
          return true;
        })
        .catch((err) => {
          this._logService.error(err);
          return false;
        });
    } else {
      this._logService.warn(`SMS Gateway not configured...`);
    }
  }
}
