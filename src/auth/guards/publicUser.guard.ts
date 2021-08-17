import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * Guard que usa las rules insertadas por el decorador
 */
@Injectable()
export class PublicUserGuard implements CanActivate {
  /**
   * @ignore
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * Guard para verificar tanto el perfil como las reglas
   * @param context
   */
  canActivate(context: ExecutionContext): boolean {
    const requiresUser = this.reflector.get<boolean>(
      'requireUser',
      context.getHandler(),
    );

    if (!requiresUser) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    return !!request.user;
  }
}
