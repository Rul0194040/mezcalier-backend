/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { ProfileTypes } from '../profiles/model/profiles.enum';
import { RequireUser } from '@mezcal/common/decorators/requireUser.decorator';
import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { User } from '../users/user.decorator';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { UsersService } from '../users/users.service';

/**
 * Controlador de avatares
 */

@ApiBearerAuth()
@ApiTags('avatar')
@Controller('avatar')
@Profiles(
  //solo acceso con perfiles
  ProfileTypes.ADMIN,
  ProfileTypes.OWNER,
  ProfileTypes.SUPER,
  ProfileTypes.PUBLIC,
)
@UseGuards(JwtAuthGuard, RulesGuard) //proteccion de perfiles
export class AvatarController {
  constructor(private readonly usersService: UsersService) {}
  private readonly filesRoute = './uploads/user'; //TODO: deberia venir de config

  /**
   * Subir archivo del usuario
   * @param file
   * @param req
   */
  @Put()
  @RequireUser() //solo con usuario
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
}
