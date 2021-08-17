import { Logger, ContextType } from '@nestjs/common';
import { readFileSync } from 'fs';
/**
 * @ignore
 */
export class MyLogger extends Logger {
  constructor() {
    super();
    //establecer el contexto del logger segun la descripción contenida en el package.json
    const appPackage = JSON.parse(readFileSync('package.json').toString());
    this.setContext(appPackage.description);
  }
  log(message: string, context?: ContextType): any {
    /* your implementation */
    super.log(`🗃️ -> ${message}`, context);
  }
  info(message: string, context?: ContextType): any {
    super.log(`ℹ️-> ${message}`, context);
  }
  error(message: string, trace?: string, context?: ContextType): any {
    /* your implementation */
    super.error(`☠️-> ${message}`, trace, context);
  }
  warn(message: string, context?: ContextType): any {
    /* your implementation */
    super.warn(`⚠️ -> ${message}`, context);
  }
  debug(message: string, context?: ContextType): any {
    /* your implementation */
    super.debug(`🐞-> ${message}`, context);
  }
  verbose(message: string, context?: ContextType): any {
    /* your implementation */
    super.verbose(`🤖-> ${message}`, context);
  }
}
