import { UpdateUserDTO } from './../../admin/users/model/updateUser.dto';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { LoginIdentityDTO } from '@mezcal/auth/dto/loginIdentity.dto';
import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { getRepository, UpdateResult } from 'typeorm';

/**
 * Controller para el manejo de usuarios desde owner
 */
@Controller('owner/users')
@Profiles(ProfileTypes.OWNER)
@UseGuards(JwtAuthGuard)
export class OwnerUsersController {
  /**
   *
   * @ignore
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtener los usuarios de una casa, solo el principal puede hacerlo
   *
   * @param user usuario en sesion
   */

  @Get()
  getUserInMyHouse(@User() user: JWTPayLoadDTO) {
    if (!user.isMain) {
      throw new HttpException(
        'Usted no tiene permiso de hacer eso.',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.usersService.getUsersByHouse(user.house.id);
  }

  /**
   * Obtiene el perfil del usuario owner
   * @param id Id del usuario owner
   */
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.getById(id, ProfileTypes.OWNER);
  }

  /**
   * Edita las rules de un usuario, verifica que las rules sean del perfil que le corresponde
   * al usuario y que sea un usuario de mi misma casa
   *
   * @param userId id del usuario al que se le editan las rules
   * @param rules nuevas rules del usuario
   * @param user el usuario en sesion
   */
  @Put(':userId/rules')
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
  @Put(':userId/reset-rules')
  resetUserRules(
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.usersService.resetUserRules(userId, user);
  }

  /**
   * Editar datos del owner secundario
   *
   *
   * @param userId el id del usuario owner
   * @param owner informacion a actualizar
   * @param user el usuario en sesion
   */
  @Put(':userId')
  updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() owner: UpdateUserDTO,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.usersService.updateUserSecundario(userId, owner, user);
  }

  /**
   * Crea un usuario secundario en la misma casa del usuario en sesion
   *
   * @param userToCreate dto del usuario a crear
   * @param user usuario en sesion
   */
  @Post()
  async createSecondaryUser(
    @Body() userToCreate: createUserDTO,
    @User() user: JWTPayLoadDTO,
  ): Promise<UserEntity> {
    //crear solo tipo owner
    const theProfile = await getRepository(ProfileEntity).findOne({
      where: { name: ProfileTypes.OWNER },
    });

    return this.usersService.create(
      userToCreate,
      theProfile,
      user.house,
      false,
    );
  }

  /**
   * un usuario principal no puede ser desactivado desde owner
   * @param id id del usuario owner que se requiere activar el estado
   * @param active true / false dependiendo de la activacion
   * @param quien user
   */
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body('active', ParseBoolPipe) active: boolean,
    @User() quien: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    if (quien.profile !== ProfileTypes.OWNER && !quien.isMain) {
      throw new HttpException(
        'Usted no puede realizar esta acción',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.usersService.updateStatus(id, active);
  }

  /**
   * Actualizacion de password al usuario
   * @param newPassword
   */
  @Put('password/change')
  updatePassword(
    @Body() newPassword: { newPassword: string; confirmPassword: string },
    @User() user: LoginIdentityDTO,
  ): Promise<boolean> {
    return this.usersService.updatePassword(user.sub, newPassword.newPassword);
  }

  /**
   * Retornar las reglas de un perfil
   *
   * @param type de que perfil
   */
  @Get('/rules/catalog')
  getOwnerProfileRules(@User() user: LoginIdentityDTO): Promise<RuleEntity[]> {
    //solo si es admin principal
    if (!user.isMain) {
      throw new HttpException('Usted no puede hacer eso', HttpStatus.FORBIDDEN);
    }
    return this.usersService.rulesByProfile(ProfileTypes.OWNER);
  }

  /**
   * Valida si ya ha sido registrado el email en un usuario
   *
   * @param email email del usuario a validar
   * @returns { ok: boolean; message: string } false si el correo ya ha sido registrado, true si esta disponible
   */
  @Post('validate')
  verificateEmail(
    @Body('email') email: string,
  ): Promise<{ ok: boolean; message: string }> {
    return this.usersService.verificateUser(email);
  }
}
