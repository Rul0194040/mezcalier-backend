/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
/**
 * Este guard debe permitir el paso del usuario aun que no tenga sesion
 */
@Injectable()
export class PublicJWTAuthGuard extends AuthGuard('jwt') {
  /**
   * @ignore
   */
  constructor(private readonly reflector: Reflector) {
    super();
  }
  /**
   * Manejo de la solicitud en el paso se sesion, si no hay sesion, continuamos.
   *
   * @param err error, si es que hay alguno
   * @param user usuario en sesion
   * @param info info adicional de passport
   */
  handleRequest(err, user, info) {
    if (err) {
      console.log('session error', err);
    }
    if (info) {
      //SI ALGUIEN TENIA SESION, PERO SU TOKEN EXPIRA O NO ES VALIDO, LO DEJA PASAR, AQUI SE PUEDE SABER
      if (info instanceof TokenExpiredError) {
        //console.log('El del usuario token ha expirado');
      }
    }
    return user;
  }
}
