import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { BrandsService } from '@mezcal/modules/owner/brands/brands.service';
import { ImagesService } from '@mezcal/common/images/images.service';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { diskStorage } from 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseBoolPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { BrandDTO } from '@mezcal/modules/owner/brands/brand.dto';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { createBrandDTO } from '@mezcal/modules/owner/brands/createBrand.dto';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { BrandCommentsEntity } from '@mezcal/modules/browser/brands/brandComments.entity';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';

@Controller('owner')
@Profiles(ProfileTypes.OWNER)
@UseGuards(JwtAuthGuard, RulesGuard)
export class OwnerBrandsController {
  /**
   * Servicios utilizados
   * @param brandsService
   * @param logger
   */
  constructor(
    private readonly brandsService: BrandsService,
    private readonly imagesService: ImagesService,
    private readonly cloudVisionService: CloudvisionService,
  ) {}
  /**
   * Listar cometarios
   *
   * @param user usuario en sesion que desautoriza el comentario
   */
  @Get('brands/comments')
  @Rules('view:brands')
  comments(@User() user: JWTPayLoadDTO): Promise<BrandCommentsEntity[]> {
    return this.brandsService.comments(user);
  }

  @Put('brands/:brandId/comment/:commentId/authorize')
  @Rules('update:brands')
  authorizeComment(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.brandsService.authorizeComment(brandId, commentId, user);
  }

  @Put('brands/:brandId/comment/:commentId/deauthorize')
  @Rules('update:brands')
  deauthorizeComment(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.brandsService.authorizeComment(brandId, commentId, user, false);
  }

  /**
   * Eliminar una imagen
   *
   * @param id de la imagen a eliminar
   */
  @ApiOperation({
    summary: 'Eliminar una imagen de la casa.',
  })
  @Rules('delete:brands_image')
  @Delete('brands/:uuid/image')
  deleteImage(
    @Param('uuid') uuid: string,
    @User() user: JWTPayLoadDTO,
  ): Promise<ImageEntity> {
    return this.imagesService.delete(uuid, user);
  }

  /**
   * Agregar imagen a la marca
   */
  @ApiOperation({
    summary: 'Agregar imagen a la casa.',
  })
  @Rules('create:brands_image')
  @Post('brands/:id/image')
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
          const dirPath = `./uploads/${ImageTypes.brand}/${req.params.id}/`;
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
    data.type = ImageTypes.brand;
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
   * PUT:id
   * @param {number} id el id de la marca
   * @param {BrandDTO} brand marca actualizada
   */
  @ApiOperation({ summary: 'Actualizar una marca' })
  @ApiResponse({ status: 200, description: 'Actualización ok.' })
  @ApiResponse({ status: 403, description: 'No tiene permiso.' })
  @ApiResponse({ status: 401, description: 'Solicitud mal formada.' })
  @Rules('update:brands')
  @Put('brands/:id')
  update(
    @Param('id') id: number,
    @Body() brand: BrandDTO,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.brandsService.update(id, brand, user);
  }

  /**
   *
   * Actualiza el estado de una marca
   * @param id Id de la marca a actualizar estado
   * @param active true / false
   * @param user usuario en sesión
   */
  @ApiOperation({ summary: 'Actualizar el estado de una marca' })
  @ApiResponse({ status: 200, description: 'Actualización ok.' })
  @ApiResponse({ status: 403, description: 'No tiene permiso.' })
  @ApiResponse({ status: 401, description: 'Solicitud mal formada.' })
  @Rules('update:brands')
  @Put('brands/:id/status')
  updateStatus(
    @Param('id') id: number,
    @Body('active', ParseBoolPipe) active: boolean,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.brandsService.updateStatus(id, active, user);
  }

  /**
   * Elimina un brando de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * Otra linea.
   *
   * @param id el brand a borrar
   */
  @ApiOperation({ summary: 'Borrar una marca' })
  @ApiResponse({ status: 200, description: 'Borrada' })
  @ApiResponse({ status: 403, description: 'No tiene permiso.' })
  @ApiResponse({ status: 401, description: 'Solicitud mal formada.' })
  @Rules('delete:brands')
  @Delete('brands/:id')
  delete(
    @Param('id') id: number,
    @User() user: JWTPayLoadDTO,
  ): Promise<DeleteResult> {
    return this.brandsService.delete(id, user);
  }

  /**
   * Crear una marca en la casa que le corresponde.
   *
   * @param {createBrandDTO} brand
   * @param req
   */
  @ApiOperation({ summary: 'Crear una marca' })
  @ApiResponse({
    status: 201,
    description: 'Retorna la marca en un objeto JSON.',
  })
  @ApiResponse({ status: 403, description: 'No tiene permiso.' })
  @ApiResponse({ status: 401, description: 'Solicitud mal formada.' })
  @Rules('create:brands')
  @Post('brands')
  create(
    @Body() brand: createBrandDTO,
    @User() user: JWTPayLoadDTO,
  ): Promise<BrandEntity> {
    //obtener la casa de la sesion del usuario.
    const data: BrandDTO = {
      nombre: brand.nombre,
      descripcion: brand.descripcion,
      house: user.house.id,
      html: brand.html,
    };
    data.house = user.house.id;
    if (!data.house) {
      throw new HttpException('Se require una casa', HttpStatus.BAD_REQUEST);
    }
    return this.brandsService.create(data);
  }

  /**
   * GET:id
   * @param id
   */
  @ApiOperation({ summary: 'Obtener una marca por id.' })
  @ApiResponse({ status: 200, description: 'Listado de marcas.' })
  @ApiResponse({ status: 403, description: 'No tiene permiso.' })
  @ApiResponse({ status: 401, description: 'Solicitud mal formada.' })
  @Rules('view:brands')
  @Get('brands/:id')
  getById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ): Promise<BrandEntity> {
    return this.brandsService.getById(id, user);
  }

  /**
   * GET
   */
  @ApiOperation({ summary: 'Get a todas las marcas de una casa' })
  @ApiResponse({ status: 200, description: 'Retorna el listado.' })
  @ApiResponse({ status: 403, description: 'No tiene permiso.' })
  @ApiResponse({ status: 401, description: 'Solicitud mal formada.' })
  @Rules('view:brands')
  @Get('brands/brandsByHouse/:id')
  getHouseId(@Param('id') id: number): Promise<BrandEntity[]> {
    return this.brandsService.getHouseId(id);
  }

  /**
   * Paginacion de marcas
   * @param options opciones de paginacion
   */
  @ApiOperation({ summary: 'Paginación de marcas' })
  @ApiResponse({ status: 201, description: 'Paginación ok.' })
  @ApiResponse({ status: 403, description: 'No tiene permiso.' })
  @ApiResponse({ status: 401, description: 'Solicitud mal formada.' })
  @Rules('view:brands')
  @Post('brands/paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
    @User() user?: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    return this.brandsService.paginate(options, user);
  }

  /**
   * Subir el logo a la marca
   *
   * @param file archivo resultante
   * @param data datos de la imagen
   * @param id id de la marca
   */
  @ApiOperation({
    summary: 'Subir el logo de la marca.',
  })
  @Rules('create:brands_image')
  @Post('brands/:id/logo')
  @UseInterceptors(
    FileInterceptor('logo', {
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
            new Error(
              'Tipo de archivo no aceptado, se aceptan solamente "image/jpg".',
            ),
            false,
          );
        }
        //si es logo, solo puede tener una.
        const logo = await getRepository(ImageEntity).findOne({
          where: { brandlogo: req.param.id },
        });
        if (logo) {
          console.log('logo encontrado', logo);
          return cb(new Error('La marca solo puede tener un logo.'), false);
        }

        return cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dirPath = `./uploads/${ImageTypes.logo}/${req.user.house.id}/${req.params.id}`;
          if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
          }
          cb(null, dirPath);
        },
        filename: (req, file, cb) => {
          const fileNameDest = `${req.params.id}.jpg`;
          cb(null, fileNameDest);
        },
      }),
    }),
  )
  async uploadLogo(
    @UploadedFile() file: FileResultDTO,
    @Body() data: SaveImageDTO,
    @Param('id', ParseIntPipe) id: number,
    @User() user: JWTPayLoadDTO,
  ): Promise<ImageEntity> {
    data.parent = id;
    data.type = ImageTypes.logo;
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
