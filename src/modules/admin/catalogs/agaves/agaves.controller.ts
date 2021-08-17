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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';

import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { AgaveDTO } from '@mezcal/modules/admin/catalogs/agaves/model/agave.dto';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { AgavesService } from '@mezcal/modules/admin/catalogs/agaves/agaves.service';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { ProfileTypes } from '../../profiles/model/profiles.enum';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { ImagesService } from '@mezcal/common/images/images.service';
import { diskStorage } from 'multer';
import { AgaveEntity } from './model/agave.entity';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { User } from '../../users/user.decorator';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('agaves')
@Controller('admin/catalogs/agaves')
@Profiles(ProfileTypes.ADMIN)
@UseGuards(JwtAuthGuard, RulesGuard)
export class AgavesController {
  /**
   * Servicios utilizados
   * @param agavesService
   * @param logger
   */
  constructor(
    private readonly agavesService: AgavesService,
    private readonly imagesService: ImagesService,
    private readonly cloudVisionService: CloudvisionService,
  ) {}

  @Put(':id/status')
  changeAgaveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) status: boolean,
  ): Promise<UpdateResult> {
    return this.agavesService.updateStatus(id, status);
  }

  /**
   * Api: GET /api/v1/agaveos/:id
   *
   * @param {number} id el id del agaveo a actualizar
   * @returns {AgaveDTO} - el agaveo de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<AgaveEntity> {
    return this.agavesService.getById(id);
  }

  /**
   * Api: PUT /api/v1/agaveos/:id
   *
   * @param {number} id el id del agaveo a actualizar
   * @param {AgaveDTO} agave los cambios al agaveo
   * @returns {AgaveDTO} - el agaveo de la base de datos
   */
  @Put(':id')
  updateAgave(
    @Param('id') id: number,
    @Body() agave: AgaveDTO,
  ): Promise<UpdateResult> {
    return this.agavesService.update(id, agave);
  }

  /**
   * Elimina un agaveo de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * Otra linea.
   *
   * @param {number} id el agaveo a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.agavesService.delete(id);
  }

  /**
   * Api: GET /api/v1/agaveos
   *
   * @returns {AgaveDTO[]} agaveos
   */
  @Get()
  get(): Promise<AgaveEntity[]> {
    return this.agavesService.get();
  }

  /**
   * Api: POST /api/v1/agaveos
   *
   * @param {AgaveDTO} agave agaveo a crear.
   * @returns {AgaveDTO} agave
   */
  @Post()
  post(@Body() agave: AgaveDTO): Promise<AgaveEntity> {
    return this.agavesService.create(agave);
  }

  /**
   * Api: POST /api/v1/agaveos/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.agavesService.paginate(options);
  }

  /**
   * Eliminar una imagen
   *
   * @param id de la imagen a eliminar
   */

  @Delete(':uuid/image')
  deleteImage(
    @Param('uuid') uuid: string,
    @User() user: JWTPayLoadDTO,
  ): Promise<ImageEntity> {
    return this.imagesService.delete(uuid, user);
  }

  /**
   * guardar imagen en el agave
   *
   * @param file archivo de imagen
   * @param data informacion de la imagen
   * @param id id del agave
   * @returns {ImageEntity} imagen guardada
   */
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 1024 * 1024 * 3, //tamaño de archivo hasta 3MB
      },
      fileFilter: async (req, file, cb) => {
        if (
          !(
            (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') &&
            (file.originalname.split('.').reverse()[0] === 'jpg' ||
              file.originalname.split('.').reverse()[0] === 'jpeg')
          )
        ) {
          return cb(
            new HttpException(
              'Tipo de archivo no aceptado, se aceptan solamente "image/jpg".',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }

        const myAgave = await getRepository(AgaveEntity)
          .createQueryBuilder('agave')
          .where('agave.id = :agaveId', {
            agaveId: req.params.id,
          })
          .getOne();

        if (!myAgave) {
          return cb(
            new HttpException('El agave no existe', HttpStatus.NOT_FOUND),
            false,
          );
        }

        return cb(null, true);
      },
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dirPath = `./uploads/${ImageTypes.agave}/${req.params.id}/`;
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
    data.type = ImageTypes.agave;
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
}
