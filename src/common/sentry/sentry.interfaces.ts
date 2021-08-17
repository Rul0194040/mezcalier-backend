import { Severity } from '@sentry/types';
/**
 * @ignore
 */
export interface ISentryFilterFunction {
  (exception: any): boolean;
}
/**
 * @ignore
 */
export interface ISentryInterceptorOptionsFilter {
  type: any;
  filter?: ISentryFilterFunction;
}
/**
 * @ignore
 */
export interface ISentryInterceptorOptions {
  filters?: ISentryInterceptorOptionsFilter[];
  tags?: { [key: string]: string };
  extra?: { [key: string]: any };
  fingerprint?: string[];
  level?: Severity;
  // https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts#L163
  request?: boolean;
  serverName?: boolean;
  transaction?: boolean | 'path' | 'methodPath' | 'handler'; // https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts#L16
  user?: boolean | string[];
  version?: boolean;
}
