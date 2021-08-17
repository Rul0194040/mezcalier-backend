import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { ISentryInterceptorOptions } from '@mezcal/common/sentry/sentry.interfaces';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';
import { Scope } from '@sentry/hub';
import {
  RpcArgumentsHost,
  WsArgumentsHost,
  HttpArgumentsHost,
} from '@nestjs/common/interfaces';
import { Handlers } from '@sentry/node';
/**
 * Meter la cuchara en todos los request, seleccionar por tipo y segun su tipo...
 * reportar a sentry.
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  /**
   * Inicialización
   * @param { Interface } options
   */
  constructor(private readonly options: ISentryInterceptorOptions = {}) {}
  /**
   * Intercepción
   * @param { ExecutionContext } context
   * @param { CallHandler } next
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // el primer parametro es para events, el segundo para  errors
    return next.handle().pipe(
      //metemos la cuchara en la excepcion (si es que hay)
      tap(null, (exception) => {
        //si pasa los filtros
        if (this.shouldReport(exception)) {
          //scope de sentry
          Sentry.withScope((scope) => {
            //segun el contexto... reportar
            switch (context.getType()) {
              case 'http':
                return this.captureHttpException(
                  scope,
                  context.switchToHttp(),
                  exception,
                );
              case 'ws':
                return this.captureWsException(
                  scope,
                  context.switchToWs(),
                  exception,
                );
              case 'rpc':
                return this.captureRpcException(
                  scope,
                  context.switchToRpc(),
                  exception,
                );
              default:
                return this.captureException(scope, exception);
            }
          });
        }
      }),
    );
  }
  /**
   * Capturamos hacia sentry.io una excepción http.
   *
   * @param scope Scope del evento
   * @param http contenedor http
   * @param exception instancia de la excepción ocurrida
   */
  private captureHttpException(
    scope: Scope,
    http: HttpArgumentsHost,
    exception: any,
  ): void {
    //parseamos los datos del contenedor
    const data = Handlers.parseRequest(
      {} as any,
      http.getRequest(),
      this.options,
    );
    //agregar datos adicionales a la captura del evento...
    scope.setExtra('req', data.request);
    data.extra && scope.setExtras(data.extra);
    if (data.user) {
      scope.setUser(data.user);
    }

    this.captureException(scope, exception);
  }
  /**
   * Para microservicios
   * @param scope
   * @param rpc
   * @param exception
   */
  private captureRpcException(
    scope: Scope,
    rpc: RpcArgumentsHost,
    exception: any,
  ): void {
    //agregar datos adicionales a la captura del evento...
    scope.setExtra('rpc_data', rpc.getData());
    this.captureException(scope, exception);
  }
  /**
   * Para sockets
   * @param scope
   * @param ws
   * @param exception
   */
  private captureWsException(
    scope: Scope,
    ws: WsArgumentsHost,
    exception: any,
  ): void {
    //agregar datos adicionales a la captura del evento...
    scope.setExtra('ws_client', ws.getClient());
    scope.setExtra('ws_data', ws.getData());
    this.captureException(scope, exception);
  }
  /**
   * Captura generica de excepcion, la usan los demas metodos.
   * @param scope el scope donde sucede la excepcion
   * @param exception la excepcion
   */
  private captureException(scope: Scope, exception: any): void {
    if (this.options.level) {
      scope.setLevel(this.options.level);
    }
    if (this.options.fingerprint) {
      scope.setFingerprint(this.options.fingerprint);
    }
    if (this.options.extra) {
      scope.setExtras(this.options.extra);
    }
    if (this.options.tags) {
      scope.setTags(this.options.tags);
    }
    Sentry.captureException(exception);
  }
  /**
   * Metodo para decidir segun el parametro filters si se incluye o no
   * @param exception La excepcion recibida
   */
  private shouldReport(exception: any): boolean {
    if (!this.options.filters) {
      return true;
    }

    // segun el tipo de filter, reportar o no
    return this.options.filters.every(({ type, filter }) => {
      return !(exception instanceof type && (!filter || filter(exception)));
    });
  }
}
