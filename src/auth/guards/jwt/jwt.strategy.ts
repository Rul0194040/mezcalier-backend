/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { LoginIdentityDTO } from '@mezcal/auth/dto/loginIdentity.dto';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
/**
 * Estrategia para validacion del jwt
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * @ignore
   */
  constructor(
    private readonly _configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _configService.get<string>(ConfigKeys.JWT_SECRET),
    });
  }
  /**
   * Validacion
   * @param payload payload data
   */
  async validate(payload: LoginIdentityDTO): Promise<LoginIdentityDTO> {
    //Retornamos lo que contiene el token como identidad.

    //aqui podriamos verificar el usuario contra la base de datos o algun otro
    //servicio, pero agrega demasiado tiempo a la solicitud cuando este viene de la BD

    //lo que retornemos aqui se adjuntara al request.
    return payload;
  }
}
