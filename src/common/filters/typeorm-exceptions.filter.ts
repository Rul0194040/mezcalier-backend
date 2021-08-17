import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryFailedError } from 'typeorm';
import { ConfigKeys } from '../enum/configkeys.enum';
/**
 * Capture all Query Exceptions ONLY!!!!
 */
@Catch(QueryFailedError)
export class TypeORMExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    const { url } = request;
    const { name, message } = exception;
    const errorResponse = {
      path: url,
      timestamp: new Date().toISOString(),
      name: name,
      message: message,
      exception: null,
    };

    if (this.configService.get<string>(ConfigKeys.NODE_ENV) !== 'production') {
      errorResponse.exception = exception;
    }

    response.status(500).json(errorResponse);
  }
}
