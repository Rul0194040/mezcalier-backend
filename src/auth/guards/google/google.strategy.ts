/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { PassportStrategy } from '@nestjs/passport';
import { VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-verify-token';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { UsersService } from '@mezcal/modules/admin/users/users.service';

/**
 * Estrategia para google
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google-verify-token',
) {
  /**
   *
   * @param _configService Sevicio de configuracion
   */
  constructor(
    private readonly _configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: _configService.get<string>(ConfigKeys.GOOGLE_CLIENT_ID),
    });
  }

  /**
   * Retorno de validacion de google login.
   *
   */
  async validate(profile, googleId, done: VerifyCallback): Promise<any> {
    const user = await this.usersService.findOrCreateGoogle(profile);
    done(null, user);
  }
}
