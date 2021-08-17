import { JWTPayLoadDTO } from './../../../auth/dto/jwtPayload.dto';
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  ParseBoolPipe,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { MastersService } from './masters.service';
import { MasterDTO } from './model/master.dto';
import { MasterEntity } from './model/master.entity';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { ImagesService } from '@mezcal/common/images/images.service';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('owner')
@Controller('owner')
@Profiles(ProfileTypes.OWNER)
@UseGuards(JwtAuthGuard, RulesGuard)
export class MastersController {
  /**
   * Servicios utilizados
   * @param mastersService
   * @param logger
   */
  constructor(
    private readonly mastersService: MastersService,
    private readonly imagesService: ImagesService,
    private readonly cloudVisionService: CloudvisionService,
  ) {}

  /**
   * Obtiene todos los maestros
   */
  @Rules('view:masters')
  @Get('masters')
  get(): Promise<MasterEntity[]> {
    return this.mastersService.get();
  }

  /**
   * Api: GET /api/v1/masteros/:id
   *
   * @param {number} id el id del mastero a actualizar
   * @returns {MasterDTO} - el mastero de la base de datos
   */
  @Rules('view:masters')
  @Get('masters/:id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<MasterEntity> {
    return this.mastersService.getById(id);
  }

  /**
   * Api: PUT /api/v1/masteros/:id
   *
   * @param {number} id el id del mastero a actualizar
   * @param {MasterDTO} master los cambios al mastero
   * @returns {MasterDTO} - el mastero de la base de datos
   */
  @Rules('update:masters')
  @Put('masters/:id')
  updateMaster(
    @Param('id') id: number,
    @Body() master: MasterDTO,
  ): Promise<UpdateResult> {
    return this.mastersService.update(id, master);
  }

  /**
   *
   * @param id id del maestro mezcalero
   * @param active status de activación true / false
   * @param user usuario en sesión
   */
  @ApiOperation({ summary: 'Actualizar el estado de un maestro' })
  @Rules('update:masters')
  @Put('masters/:id/status')
  updateMasterStatus(
    @Param('id') id: number,
    @Body('active', ParseBoolPipe) active: boolean,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.mastersService.updateStatus(id, active, user);
  }

  /**
   * Elimina un mastero de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * Otra linea.
   *
   * @param {number} id el mastero a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Rules('delete:masters')
  @Delete('masters/:id')
  delete(
    @Param('id') id: number,
    @User() usuario: UserEntity, //obtenemos el usuario del jwt
  ): Promise<DeleteResult> {
    //pasamos el usuario al service, para que use la casa de ese usuario como
    //filtro al borrar
    return this.mastersService.delete(id, usuario);
  }

  /**
   * Api: POST /api/v1/maestros
   *
   * @param {MasterDTO} master mastero a crear.
   * @returns {MasterDTO} master
   */
  @Rules('create:masters')
  @Post('masters')
  post(
    @Body() master: MasterDTO,
    @User() usuario: UserEntity, //obtener el usuario del jwt
  ): Promise<MasterEntity> {
    //pasamos el usuario al service para que cree el master en la casa
    //de ese usuario
    return this.mastersService.create(master, usuario);
  }

  /**
   * Api: POST /api/v1/masteros/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Rules('view:masters')
  @Post('masters/paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
    @User() user: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    return this.mastersService.paginate(options, user);
  }

  /**
   * Agregar imagen a maestro mezcalero
   * @param file datos del archivo
   * @param data datos de la imagen
   * @param id del maestro
   */
  @ApiOperation({
    summary: 'Agregar imagen a la casa.',
  })
  @Rules('create:masters_image')
  @Put('masters/:id/image')
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
          const dirPath = `./uploads/${ImageTypes.master}/${req.params.id}/`;
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
    data.type = ImageTypes.master;
    const imagenSubida = await this.imagesService.save(file, data);
    try {
      const imageFile = imagenSubida.uuid + '.jpg';
      const imagePath = imagenSubida.destination + imageFile;
      await this.cloudVisionService.uploadFile(imagePath);
      await this.cloudVisionService.createReferenceImage(
        id,
        imageFile,
        `gs://${this.cloudVisionService.bucketName}/${imageFile}`,
      );
    } catch (error) {
      console.log(error);
    }

    return imagenSubida;
  }

  /**
   * eliminar imagen a maestro mezcalero
   * @param id del maestro
   */
  @ApiOperation({
    summary: 'Eliminar imagen a la casa.',
  })
  @Rules('delete:masters_image')
  @Delete('masters/:uuid/image')
  deleteImage(
    @Param('uuid') uuid: string,
    @User() user: JWTPayLoadDTO,
  ): Promise<ImageEntity> {
    return this.imagesService.delete(uuid, user);
  }
}
