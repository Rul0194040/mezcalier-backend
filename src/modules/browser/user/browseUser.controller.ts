import { diskStorage } from 'multer';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { PublicJWTAuthGuard } from '@mezcal/auth/guards/publicJwt.guard';
import { PublicUserGuard } from '@mezcal/auth/guards/publicUser.guard';
import { RequireUser } from '@mezcal/common/decorators/requireUser.decorator';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { UpdateResult } from 'typeorm';
import { UpdateUserDTO } from '@mezcal/modules/admin/users/model/updateUser.dto';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';

@Controller('browse/users')
@UseGuards(PublicJWTAuthGuard, PublicUserGuard)
export class BrowseUserController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Ver el nombre y apellido del usuario, por id
   *
   * @param id del usuario que se solicita
   *
   * @returns siempre regresa un 200
   */
  @Get(':id')
  getById(@Body() id: number) {
    return this.usersService.getNombreById(id);
  }

  /**
   * Inicia la solicitud de cambio del password de un usuario
   *
   * @param email email del usuario que solicita el cambio
   *
   * @returns siempre regresa un 200
   */
  @Put('password-reset')
  passwordReset(@Body('email') email: string) {
    //desde este controller solo cambiar los de public
    return this.usersService.startPasswordReset(email, ProfileTypes.PUBLIC);
  }

  /**
   * Cambia el password de un usuario segun el email y el token recibido,
   * la fecha del token aun debe ser valida.
   *
   * @param token el token a validar
   * @param newPassword el nuevo password del usuario
   * @param email Email del usuario
   *
   * @returns {UpdateResult} el update result con affected=1 cuando si se hizo el cambio,
   * si no se hizo, es por que o el email no coincide, o el token no coincide o el token ya
   * expiró o ya fué usado.
   *
   */

  @Put('password-reset/:token')
  async getPasswordToken(
    @Param('token') token: string,
    @Body('password') newPassword: string,
    @Body('email') email: string,
  ): Promise<UpdateResult> {
    return this.usersService.changePasswordByToken(email, token, newPassword);
  }

  /**
   * Subir archivo del usuario en sesion
   *
   * @param avatar el archivo a usar
   */
  @Put('avatar')
  @RequireUser()
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 1024 * 1024 * 3, //tamaño de archivo hasta 3MB //TODO: deberia venir de config
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpg', 'image/jpeg'];
        if (
          allowedTypes.indexOf(file.mimetype) > -1 &&
          (file.originalname.split('.').reverse()[0] === 'jpg' ||
            file.originalname.split('.').reverse()[0] === 'jpeg')
        ) {
          return cb(null, true);
        }
        return cb(
          new Error(
            'Tipo de archivo no aceptado, se aceptan solamente "image/jpeg".',
          ),
          false,
        );
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uuid = req.user.uuid;
          const dirPath = './uploads/user'; //TODO: deberia venir de config
          if (!existsSync(`${dirPath}`)) {
            mkdirSync(`${dirPath}`, { recursive: true });
          }
          if (existsSync(`${dirPath}/${uuid}.jpg`)) {
            unlinkSync(`${dirPath}/${uuid}.jpg`);
          }
          cb(null, dirPath);
        },
        filename: (req, file, cb) => {
          const uuid = req.user.uuid;
          const fileNameDest = `${uuid}.jpg`;
          cb(null, fileNameDest);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file,
    @User() quien: JWTPayLoadDTO,
  ): Promise<any> {
    //actualizar picUrl del usuario.
    await this.usersService.updateUserPicture(
      quien.sub,
      `/browse/avatar/${quien.uuid}`,
    );
    return file;
  }
  /**
   * Cambia la contraseña de un usuario con sesion
   *
   * @param password contraseña actual
   * @param newPassword contraseña nueva
   * @param user usuario que cambia, proviene de sesion
   */
  @Put('password/change')
  @RequireUser()
  async changePassword(
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.usersService.changePassword(user, password, newPassword);
  }

  /**
   * Actualizacion de usuarios
   *
   * @param id
   * @param user
   */
  @Put('user')
  @RequireUser()
  update(
    @Param('id') id: number,
    @Body() user: UpdateUserDTO,
    @User() quien: UserEntity,
  ): Promise<UpdateResult> {
    return this.usersService.update(quien.id, user);
  }
}
