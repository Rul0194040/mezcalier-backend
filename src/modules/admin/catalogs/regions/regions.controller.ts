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

import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { RegionDTO } from '@mezcal/modules/admin/catalogs/regions/model/region.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { RegionsService } from '@mezcal/modules/admin/catalogs/regions/regions.service';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { RegionEntity } from './model/region.entity';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { ImagesService } from '@mezcal/common/images/images.service';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { User } from '../../users/user.decorator';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('regions')
@Controller('admin/catalogs/regions')
@UseGuards(JwtAuthGuard)
export class RegionsController {
  /**
   * Servicios utilizados
   * @param regionsService
   * @param logger
   */
  constructor(
    private readonly regionsService: RegionsService,
    private readonly imagesService: ImagesService,
    private readonly cloudVisionService: CloudvisionService,
  ) {}
  /**
   * Api: GET /api/v1/regionos/:id
   *
   * @param {number} id el id del regiono a actualizar
   * @returns {RegionDTO} - el regiono de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<RegionEntity> {
    return this.regionsService.getById(id);
  }

  /**
   * Api: PUT /api/v1/regionos/:id
   *
   * @param {number} id el id del regiono a actualizar
   * @param {RegionDTO} region los cambios al regiono
   * @returns {RegionDTO} - el regiono de la base de datos
   */
  @Put(':id')
  updateRegion(
    @Param('id') id: number,
    @Body() region: RegionDTO,
  ): Promise<UpdateResult> {
    return this.regionsService.update(id, region);
  }

  /**
   * Cambia el estado de una region
   *
   * @param id de la region a cambiar
   * @param {boolean} active estatus a establecer
   */
  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) active: boolean,
  ): Promise<UpdateResult> {
    return this.regionsService.updateStatus(id, active);
  }

  /**
   * Elimina un regiono de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * Otra linea.
   *
   * @param {number} id el regiono a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.regionsService.delete(id);
  }

  /**
   * Api: GET /api/v1/regionos
   *
   * @returns {RegionDTO[]} regionos
   */
  @Get()
  get(): Promise<RegionEntity[]> {
    return this.regionsService.get();
  }

  /**
   * Api: POST /api/v1/regionos
   *
   * @param {RegionDTO} region regiono a crear.
   * @returns {RegionDTO} region
   */
  @Post()
  post(@Body() region: RegionDTO): Promise<RegionEntity> {
    return this.regionsService.create(region);
  }

  /**
   * Api: POST /api/v1/regionos/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.regionsService.paginate(options);
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
   * guardar imagen en la region
   *
   * @param file archivo de imagen
   * @param data informacion de la imagen
   * @param id id del agave
   * @returns {RegionEntity} imagen guardada
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

        const myRegion = await getRepository(RegionEntity)
          .createQueryBuilder('region')
          .where('region.id = :regionId', {
            regionId: req.params.id,
          })
          .getOne();

        if (!myRegion) {
          return cb(
            new HttpException('La region no existe', HttpStatus.NOT_FOUND),
            false,
          );
        }

        return cb(null, true);
      },
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dirPath = `./uploads/${ImageTypes.region}/${req.params.id}/`;
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
    data.type = ImageTypes.region;
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
