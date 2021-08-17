import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '../enum/configkeys.enum';

/**
 * Atrapa todas las excepciones HTTP
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  private logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    const { url } = request;
    const errorResponse = {
      path: url,
      timestamp: new Date().toISOString(),
      name: exception.name,
      message: exception.message,
      method: request.method,
      code: exception.getStatus(),
    };

    if (this.configService.get<string>(ConfigKeys.NODE_ENV) !== 'production') {
      this.logger.log(errorResponse);
      this.logger.log(exception.stack);
    }

    response.status(exception.getStatus()).json(errorResponse);
  }
}
