import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Body,
  ParseBoolPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Rules } from '@mezcal//common/decorators/rules.decorator';
import { RulesGuard } from '@mezcal//auth/guards/rules/rules.guard';
import { JwtAuthGuard } from '@mezcal//auth/guards/jwt/jwt-auth.guard';

import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal//common/dto/pagination/paginationprimeng.dto';
import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { ProfileTypes } from '../profiles/model/profiles.enum';
import { ProfilesService } from '../profiles/profiles.service';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { UpdateUserDTO } from './model/updateUser.dto';
import { LoginIdentityDTO } from '@mezcal/auth/dto/loginIdentity.dto';

/**
 * Controlador de usuarios
 * utilizado por super y admin
 */

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin')
@Profiles(ProfileTypes.SUPER, ProfileTypes.ADMIN)
@UseGuards(JwtAuthGuard, RulesGuard)
export class UsersController {
  /**
   * Servicios utilizados
   * @param usersService
   * @param logger
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly profileService: ProfilesService,
  ) {}

  /**
   * Obtener usuario por id
   *
   * @param id
   */
  @Rules('view:user')
  @Get('users/:id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    //desde aqui solo mostrarmos admins
    return this.usersService.getById(id, ProfileTypes.ADMIN);
  }

  /**
   * Actualizacion de usuarios
   *
   * @param id
   * @param user
   */
  @Rules('update:users')
  @Put('users/:id')
  update(
    @Param('id') id: number,
    @Body() user: UpdateUserDTO,
  ): Promise<UpdateResult> {
    return this.usersService.update(id, user);
  }

  /**
   * Edita las rules de un usuario, verifica que las rules sean del perfil que le corresponde
   * al usuario y que sea un usuario de mi misma casa
   *
   * @param userId id del usuario al que se le editan las rules
   * @param rules nuevas rules del usuario
   * @param user el usuario en sesion
   */
  @Put('users/:userId/rules')
  updateUserRules(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('rules') rules: string[],
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.usersService.updateUserRules(userId, rules, user);
  }

  /**
   * Resetea las rules de un usuario al default de su perfil, verifica que el
   * usuario sea de mi misma casa
   *
   * @param userId el id del usuario a resetear sus rules
   * @param user el usuario en sesion
   */
  @Put('users/:userId/reset-rules')
  resetUserRules(
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.usersService.resetUserRules(userId, user);
  }

  /**
   * Eliminacion de usuarios
   *
   * @param id
   */
  @Rules('delete:users')
  @Delete('users/:id')
  deleteUser(@Param('id') id: number): Promise<DeleteResult> {
    return this.usersService.delete(id);
  }

  @Rules('create:users')
  @Put('users/:id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body('active', ParseBoolPipe) active: boolean,
    @User() quien: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //solo el admin principal o super pueden acceder
    //el admin principal no puede desactivarse a si mismo
    if (
      (quien.profile !== ProfileTypes.SUPER && !quien.isMain) ||
      quien.id === id
    ) {
      throw new HttpException('Usted no puede hacer eso', HttpStatus.FORBIDDEN);
    }

    return await this.usersService.updateStatus(id, active);
  }

  /**
   * Listado de usuarios, solo mostrar admins
   */
  @Rules('view:users')
  @Get('users')
  get(): Promise<UserEntity[]> {
    //desde aqui solo se pueden ver perfiles admin
    return this.usersService.getByProfileType(ProfileTypes.ADMIN);
  }

  /**
   * Creacion de usuarios, aqui postea el super y el admin, y segun quien sea...
   * el superadmin solo puede crear admins principales,
   * el admin solo puede crear admins secundarios
   * solo puede haber un administrador principal en el sistema,
   * el cual no se puede borrar ni desactivar
   *
   * @param user
   */
  @Rules('create:users') //establecer las rules a usar en este metodo
  @Post('users')
  async create(
    @Body() user: createUserDTO,
    @User() quien: JWTPayLoadDTO,
  ): Promise<UserEntity> {
    user.active = false; //crear los usuarios inactivos.
    //solo si es superadmin o admin principal, puede continuar
    if (
      quien.profile !== ProfileTypes.SUPER && //si no es super, y
      !quien.isMain //no es principal (super siempre es principal).
    ) {
      //regresar un 403
      throw new HttpException('Usted no puede hacer eso', HttpStatus.FORBIDDEN);
    }

    let isPrincipal = true; //crear como principal inicialmente

    //desde este punto, solo perfiles admin se pueden crear.
    const adminProfile = await this.profileService.getByName(
      ProfileTypes.ADMIN,
    );

    //solo puede haber un admin principal, si no existe, el primero en crearse es el principal,
    const adminPrincipal = await this.usersService.getByProfileType(
      ProfileTypes.ADMIN,
    );

    if (adminPrincipal.length) {
      //ya hay por lo menos 1, crear como secundario
      isPrincipal = false;
    }

    const createdUser = await this.usersService.create(
      user,
      adminProfile,
      undefined, //sin casa
      isPrincipal,
    );
    return createdUser;
  }

  /**
   * Paginacion de usuarios
   *
   * @param options
   */
  @Rules('view:users') //establecer las rules a usar en este metodo
  @Post('users/paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.usersService.paginate(options);
  }

  /**
   * Valida si ya ha sido registrado el email en un usuario
   *
   * @param email email del usuario a validar
   * @returns { ok: boolean; message: string } false si el correo ya ha sido registrado, true si esta disponible
   */
  @Rules('view:users')
  @Post('users/validate')
  verificateEmail(
    @Body('email') email: string,
  ): Promise<{ ok: boolean; message: string }> {
    return this.usersService.verificateUser(email);
  }

  /**
   * Actualizacion de password al usuario
   * @param newPassword
   */
  @Put('users/password/change')
  updatePassword(
    @Body() newPassword: { newPassword: string; confirmPassword: string },
    @User() user: LoginIdentityDTO,
  ): Promise<boolean> {
    return this.usersService.updatePassword(user.sub, newPassword.newPassword);
  }
}
