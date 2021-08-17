import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { intersection } from 'lodash';
/**
 * Guard que usa las rules insertadas por el decorador
 */
@Injectable()
export class RulesGuard implements CanActivate {
  /**
   * @ignore
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * Guard para verificar tanto el perfil como las reglas
   * @param context
   */
  canActivate(context: ExecutionContext): boolean {
    //obtener las rules de metadata en contexto de quien lo llama (context.getHandler()=controller)
    const rulesMethod = this.reflector.get<string[]>(
      'rules', //metadatos inyectados por el decorador @Rules a nivel metodo
      context.getHandler(), //metodo
    ); //= ['delete:brands']

    const profilesController = this.reflector.get<string[]>(
      'profiles', //metadatos inyectados por el decorador @Profiles a nivel controller
      context.getClass(), //controller
    ); //= [ProfileTypes.OWNER]
    // esta ruta tiene rules, obtener el user del request...
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    //dejar pasar siempre a super
    if (user.profile === ProfileTypes.SUPER) {
      return true;
    }

    //el controller filtra perfiles?
    if (profilesController) {
      //el usuario no tiene el perfil
      if (profilesController.indexOf(user.profile) === -1) {
        return false; //no pasa
      }
    }

    //si la ruta no tiene metadata rules
    if (!rulesMethod) {
      return true; //pasa
    }

    //si el usuario tiene por lo menos una de las rules en las suyas, pasa
    return !!intersection(rulesMethod, user.rules).length;
  }
}
