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
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { HouseDTO } from '@mezcal/modules/browser/houses/dtos/house.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { HousesService } from '@mezcal/modules/owner/houses/houses.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { ImagesService } from '@mezcal/common/images/images.service';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { HouseCommentsEntity } from '@mezcal/modules/browser/houses/models/houseComments.entity';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('owner')
@Controller('owner') // /houses
@Profiles(ProfileTypes.OWNER)
@UseGuards(JwtAuthGuard) //usar estos guards en el controller
export class OwnerHousesController {
  /**
   * Servicios utilizados
   * @param housesService
   * @param logger
   */
  constructor(
    private readonly housesService: HousesService,
    private readonly imagesService: ImagesService,
  ) {}
  /**
   * Eliminar una imagen
   *
   * @param id de la imagen a eliminar
   */
  @ApiOperation({
    summary: 'Eliminar una imagen de la casa.',
  })
  @Rules('delete:houses_image')
  @Delete('houses/:uuid/image') //TODO: obtener el id de la casa de la sesion ya no de la url
  deleteImage(
    @Param('uuid') uuid: string,
    @User() user: JWTPayLoadDTO,
  ): Promise<ImageEntity> {
    return this.imagesService.delete(uuid, user);
  }

  /**
   * Subir una imagen a la casa
   *
   * @param file archivo resultante
   * @param data datos de la imagen
   * @param id id de la casa
   */
  @ApiOperation({
    summary: 'Agregar imagen a la casa.',
  })
  @Rules('create:houses_image')
  @Post('houses/:id/image') //TODO: obtener el id de la casa de la sesion ya no de la url
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 1024 * 1024 * 3, //tamaño de archivo hasta 3MB
      },
      fileFilter: (req, file, cb) => {
        if (
          (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') &&
          (file.originalname.split('.').reverse()[0] === 'jpg' ||
            file.originalname.split('.').reverse()[0] === 'jpeg')
        ) {
          return cb(null, true);
        }
        return cb(
          new HttpException(
            'Tipo de archivo no aceptado, se aceptan solamente "image/jpg".',
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dirPath = `./uploads/${ImageTypes.house}/${req.params.id}/`;
          if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
          }
          cb(null, dirPath);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile() file: FileResultDTO,
    @Body() data: SaveImageDTO,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ImageEntity> {
    data.parent = id;
    data.type = ImageTypes.house;
    return await this.imagesService.save(file, data);
  }
  /**
   * Listar cometarios
   *
   * @param user usuario en sesion que desautoriza el comentario
   */
  @Rules('view:houses')
  @Get('houses/comments')
  comments(@User() user: JWTPayLoadDTO): Promise<HouseCommentsEntity[]> {
    return this.housesService.comments(user);
  }

  @Put('houses/:houseId/comment/:commentId/authorize')
  @Rules('update:houses')
  authorizeComment(
    @Param('houseId', ParseIntPipe) houseId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.housesService.authorizeComment(houseId, commentId, user);
  }

  @Put('houses/:houseId/comment/:commentId/deauthorize')
  @Rules('update:houses')
  deauthorizeComment(
    @Param('houseId', ParseIntPipe) houseId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.housesService.authorizeComment(houseId, commentId, user, false);
  }

  /**
   * Obtener casa por id
   * @param id id de la casa
   */
  @Rules('view:houses')
  @Get('houses/:id') //TODO: obtener el id de la casa de la sesion ya no de la url
  getById(@Param('id', ParseIntPipe) id: number): Promise<HouseDTO> {
    return this.housesService.getById(id);
  }

  /**
   * Actualizar una casa
   *
   * @param id id de la casa a actualizar
   * @param casa objeto de actualizacion
   */
  @Rules('update:houses')
  @Put('houses/:id') //TODO: obtener el id de la casa de la sesion ya no de la url
  update(
    @Param('id') id: number,
    @Body() casa: HouseDTO,
    @User() user: JWTPayLoadDTO,
  ): Promise<HouseDTO> {
    return this.housesService.update(id, casa, user);
  }

  /**
   * Valida si ya ha sido registrado el email en una casa
   *
   * @param email email de la casa a validar
   * @returns { ok: boolean; message: string } false si el correo ya ha sido registrado, true si esta disponible
   */
  @Rules('view:houses')
  @Post('houses/validate')
  async validarCasa(
    @Body('email') email: string,
  ): Promise<{ ok: boolean; message: string }> {
    return this.housesService.verificateHouse(email);
  }
}
