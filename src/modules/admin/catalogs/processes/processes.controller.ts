import { ImagesService } from '@mezcal/common/images/images.service';
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
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  //Patch,
} from '@nestjs/common';

import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { ProcesseDTO } from '@mezcal/modules/admin/catalogs/processes/model/processe.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { ProcessesService } from '@mezcal/modules/admin/catalogs/processes/processes.service';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { ProcesseEntity } from './model/processe.entity';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('processes')
@Controller('admin/catalogs/processes')
@UseGuards(JwtAuthGuard)
export class ProcessesController {
  /**
   * Servicios utilizados
   * @param processesService
   * @param logger
   */
  constructor(
    private readonly processesService: ProcessesService,
    private readonly imagesService: ImagesService,
    private readonly cloudVisionService: CloudvisionService,
  ) {}
  /**
   * Api: GET /api/v1/processeos/:id
   *
   * @param {number} id el id del processeo a actualizar
   * @returns {ProcesseDTO} - el processeo de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<ProcesseDTO> {
    return this.processesService.getById(id);
  }

  @Get(':id/full')
  getByIdFull(@Param('id', ParseIntPipe) id: number): Promise<ProcesseDTO> {
    return this.processesService.getById(id, true);
  }

  /**
   * Api: PUT /api/v1/processeos/:id
   *
   * @param {number} id el id del processeo a actualizar
   * @param {ProcesseDTO} processe los cambios al processeo
   * @returns {ProcesseDTO} - el processeo de la base de datos
   */
  @Put(':id')
  put(
    @Param('id') id: number,
    @Body() processe: ProcesseDTO,
  ): Promise<UpdateResult> {
    return this.processesService.update(id, processe);
  }

  /**
   * Cambia el estado de una processe
   *
   * @param id de la processe a cambiar
   * @param {boolean} active estatus a establecer
   */
  @Put(':id/status')
  putStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) active: boolean,
  ): Promise<UpdateResult> {
    return this.processesService.updateStatus(id, active);
  }

  /**
   * Elimina un processeo de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * API DELETE /api/v1/catalogs/processes/:id
   *
   * @param {number} id el processeo a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.processesService.delete(id);
  }

  /**
   * Api: GET /api/v1/processeos
   *
   * @returns {ProcesseDTO[]} processeos
   */
  @Get()
  get(): Promise<ProcesseDTO[]> {
    return this.processesService.get();
  }

  /**
   * Api: POST /api/v1/processeos
   *
   * @param {ProcesseDTO} processe processeo a crear.
   * @returns {ProcesseDTO} processe
   */
  @Post()
  post(@Body() processe: ProcesseDTO): Promise<ProcesseDTO> {
    return this.processesService.create(processe);
  }

  /**
   * Api: POST /api/v1/processeos/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.processesService.paginate(options);
  }

  /**
   * guardar imagen en la processe
   *
   * @param file archivo de imagen
   * @param data informacion de la imagen
   * @param id id del agave
   * @returns {ProcesseEntity} imagen guardada
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

        const myProcesse = await getRepository(ProcesseEntity)
          .createQueryBuilder('processe')
          .where('processe.id = :processeId', {
            processeId: req.params.id,
          })
          .getOne();

        if (!myProcesse) {
          return cb(
            new HttpException('La processe no existe', HttpStatus.NOT_FOUND),
            false,
          );
        }

        return cb(null, true);
      },
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dirPath = `./uploads/${ImageTypes.processe}/${req.params.id}/`;
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
    data.type = ImageTypes.processe;
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
  /*
  //admin/catalogs/processes/:id/millings
  @Patch(':idProcesse/millings/add/:idMilling')
  async patchMillingsAdd(
    @Param('idProcesse', ParseIntPipe) idProcesse: number,
    @Param('idMilling', ParseIntPipe) idMilling: number,
  ): Promise<void> {
    return this.processesService.patchMillingsAdd(idProcesse, idMilling);
  }

  @Patch(':idProcesse/millings/remove')
  async patchMillingsRemove(
    @Param('idProcesse', ParseIntPipe) idProcesse: number,
    @Param('idMilling', ParseIntPipe) idMilling: number,
  ): Promise<void> {
    return this.processesService.patchMillingsRemove(idProcesse, idMilling);
  }*/
}
