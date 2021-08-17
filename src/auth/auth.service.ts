import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { UsersService } from '@mezcal/modules/admin/users/users.service';

import * as _ from 'lodash';
import { LoginResponseDTO } from '@mezcal/auth/dto/loginresponse.dto';
import { compare } from 'bcryptjs';
import { LoginIdentityDTO } from '@mezcal/auth/dto/loginIdentity.dto';

/**
 * Service de auth
 */
@Injectable()
export class AuthService {
  /**
   * @ignore
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * Validamos al usuario, vamos por el con el service, y validamos su password.
   *
   * @param email Usuario que viene de post
   * @param pass Password en post
   * @returns null
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.active) {
      throw new HttpException(
        'Su cuenta no está activa',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (await compare(pass, user.password)) {
      return _.omit(user, ['password']);
    }

    throw new HttpException(
      'Sus credenciales no son válidas',
      HttpStatus.UNAUTHORIZED,
    );

    return null;
  }
  /**
   * Generación del JWT del usuario
   *
   * @param user Usuario que ha iniciado sesión.
   * @returns {LoginResponseDTO} response adecuada conteniendo el token y la identidad del usuario.
   */
  async login(user: UserEntity): Promise<LoginResponseDTO> {
    const identity: LoginIdentityDTO = {
      sub: user.id,
      uuid: user.uuid,
      id: user.id,
      house: user.house,
      email: user.email,
      rules: user.rules,
      firstName: user.firstName,
      lastName: user.lastName,
      picUrl: user.picUrl,
      createdAt: user.createdAt,
      validEmail: user.validEmail,
      profile: user.profile.name,
      isMain: user.isMain,
    };

    return {
      //se retorna al front
      access_token: this.jwtService.sign(identity),
      identity: identity,
    };
  }
  /**
   * Validar Codigo
   *
   * @param code codigo a validar
   * @param user usuario
   */

  async validateCode(
    code: string,
    user: UserEntity,
  ): Promise<LoginResponseDTO | boolean> {
    if (!code) {
      return false;
    }

    const identity: LoginIdentityDTO = {
      sub: user.id,
      uuid: user.uuid,
      id: user.id,
      email: user.email,
      rules: user.rules,
      house: user.house,
      firstName: user.firstName,
      lastName: user.lastName,
      picUrl: user.picUrl,
      createdAt: user.createdAt,
      validEmail: user.validEmail,
      profile: user.profile.name,
      isMain: user.isMain,
    };

    return {
      //se retorna al front
      access_token: this.jwtService.sign(identity),
      identity: identity,
    };
  }
}
