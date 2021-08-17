import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { Strategy } from 'passport-facebook-token-nest';
import { UsersService } from '@mezcal/modules/admin/users/users.service';

/**
 * Estrategia para iniciar sesion con facebook.
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  'facebook-token',
) {
  /**
   * @ignore
   */
  constructor(
    private readonly _configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: _configService.get<string>(ConfigKeys.FB_APP_ID),
      clientSecret: _configService.get<string>(ConfigKeys.FB_APP_SECRET),
    });
  }

  /**
   * Metodo de validacion estandar de la estrategia,
   * @param accessToken
   * @param refreshToken
   * @param profile
   * @param done
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const user = await this.usersService.findOrCreateFB(profile);
    done(null, user);
  }
}
