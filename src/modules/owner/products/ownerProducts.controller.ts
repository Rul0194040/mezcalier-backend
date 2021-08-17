import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseBoolPipe,
  Logger,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ImagesService } from '../../../common/images/images.service';
import { ImageTypes } from '../../../common/images/imageTypes.enum';
import { ImageEntity } from '../../../common/images/model/image.entity';
import { ProductEntity } from '../../product.entity';
import { ProductsService } from './products.service';
import { ProfileTypes } from '../../admin/profiles/model/profiles.enum';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { createProductDTO } from '@mezcal/modules/owner/products/dtos/createProduct.dto';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { UpdateProductDTO } from './dtos/updateProduct.dto';
import { RequireUser } from '@mezcal/common/decorators/requireUser.decorator';
import { ProductCommentsEntity } from '@mezcal/modules/browser/models/productComments.entity';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';
@Controller('owner')
@UseGuards(JwtAuthGuard, RulesGuard)
@Profiles(ProfileTypes.OWNER) //solo perfil owner
export class OwnerProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imagesService: ImagesService,
    private readonly cloudVisionService: CloudvisionService,
  ) {}

  private readonly logger = new Logger(OwnerProductsController.name);

  /**
   * Listar cometarios
   *
   * @param user usuario en sesion que desautoriza el comentario
   */
  @Get('products/comments')
  @Rules('view:products')
  @RequireUser()
  comments(@User() user: JWTPayLoadDTO): Promise<ProductCommentsEntity[]> {
    return this.productsService.comments(user);
  }
  //products...
  /**
   * Crear un producto, solo el owner de la casa puede hacerlo.
   * Api: POST /api/v1/owner/products
   *
   * @param {ProductDTO} product producto a crear.
   * @returns {ProductDTO} product
   */
  @Rules('create:products')
  @Post('products')
  async post(
    @Body() product: createProductDTO,
    @User() user: JWTPayLoadDTO,
  ): Promise<ProductEntity> {
    const productoCreado = await this.productsService.create(product, user);
    //subir el producto a googleProducts
    try {
      const creado = await this.cloudVisionService.createProduct(
        productoCreado.id,
        productoCreado.nombre,
        productoCreado.descripcion,
      );
      /**
       { productLabels: [],
                        /idproyecto         /idlocation       /id producto
         name: 'projects/mezcalier/locations/us-west1/products/6', 
         displayName: 'Otro Producto',
         description: 'Mezcal',
         productCategory: 'general-v1' 
        }
       */
      this.logger.log('Se ha creado el producto a googleCloudVision.');
      console.log(creado);

      //agregarlo al set de mezcales.
      const result = await this.cloudVisionService.addProductToProductSet(
        productoCreado.id,
      );
      //result = [ {}, null, null ]
      this.logger.log('Se ha agregado el producto a al productSet.');
      console.log(result);
    } catch (error) {
      //en caso de que esto no se haya podido hacer, continuamos, pero notificamos al admin.
      this.logger.error('No se pudo crear el producto en googleCloudVision.');
      console.error(error);
    }
    return productoCreado;
  }

  /**
   * Eliminar una imagen, no debe poder eliminar imagenes
   * de productos que no le pertenecen a la casa del usuario
   *
   * @param uuid de la imagen a eliminar
   */
  @ApiOperation({
    summary: 'Eliminar una imagen del producto.',
  })
  @Rules('delete:products_image')
  @Delete('products/:uuid/image')
  async deleteImage(
    @Param('uuid') uuid: string,
    @User() user: JWTPayLoadDTO,
  ): Promise<ImageEntity | HttpException> {
    const deletedImage: ImageEntity = await this.imagesService.delete(
      uuid,
      user,
    );
    try {
      //borrar la imagen del bucket
      await this.cloudVisionService.deleteFile(`${uuid}.jpg`);
      //quitar referencia de imagen
      await this.cloudVisionService.deleteReferenceImage(
        deletedImage.productId,
        `${uuid}.jpg`,
      );
    } catch (error) {
      this.logger.error(
        'Error al interactuar con google cloud vision. (borrar imagen)',
      );
      console.error(error);
    }

    return deletedImage;
  }

  /**
   * Agregar imagen a un producto, que sea de una marca de la casa del usuario que lo agrega
   *
   * @param file datos del archivo
   * @param data datos de la imagen
   * @param id del producto
   */
  @ApiOperation({
    summary: 'Agregar imagen a la casa.',
  })
  @Rules('create:products_image')
  @Post('products/:id/image')
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

        //si el producto no es de una marca de la casa del usuario
        const myProduct = await getRepository(ProductEntity)
          .createQueryBuilder('product')
          .leftJoin('product.brand', 'brand')
          .leftJoin('brand.house', 'house')
          .where('product.id = :productId AND house.id = :houseId', {
            productId: req.params.id,
            houseId: req.user.house.id,
          })
          .getOne();

        if (!myProduct) {
          return cb(
            new HttpException('El producto no existe', HttpStatus.NOT_FOUND),
            false,
          );
        }

        return cb(null, true);
      },
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dirPath = `./uploads/${ImageTypes.product}/${req.params.id}/`;
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
    data.type = ImageTypes.product;

    const imagenSubida = await this.imagesService.save(file, data);
    //poner la imagen en el bucket

    try {
      const imageFile = imagenSubida.uuid + '.jpg';
      const imagePath = imagenSubida.destination + imageFile;
      //const result =
      await this.cloudVisionService.uploadFile(imagePath);
      this.logger.log('Imagen subida al bucket.');
      //console.log(result);
      //agregar la imagen al producto
      await this.cloudVisionService.createReferenceImage(
        id,
        imageFile,
        `gs://${this.cloudVisionService.bucketName}/${imageFile}`,
      );
      this.logger.log('Imagen referenciada');
    } catch (error) {
      this.logger.error('No se pudo subir la imagen al bucket.');
      console.log(error);
    }

    return imagenSubida;
  }

  /**
   * Api: PUT /api/v1/productos/:id, se verifica que el producto
   * pertenezca al usuario que edita.
   *
   * @param {number} id el id del producto a actualizar
   * @param {UpdateProductDTO} updateData los cambios al producto
   * @returns {UpdateResult} - el result del update
   */
  @Rules('update:products')
  @Put('products/:id')
  updateProduct(
    @Param('id') id: number,
    @Body() updateData: UpdateProductDTO,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.update(id, updateData, user);
  }
  /**
   *
   * Actualiza el estado de un producto
   * @param id Id de la marca a actualizar estado
   * @param active true / false
   * @param user usuario en sesión
   */
  @Rules('update:products')
  @Put('products/:id/status')
  updateStatus(
    @Param('id') id: number,
    @Body('active', ParseBoolPipe) active: boolean,
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateStatus(id, active, user);
  }

  /**
   * Actualiza los agaves de un producto, se verifica que el producto pertenezca
   * a la casa y que los agaves existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} agaves array de ids de los agaves a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/agaves')
  updateProductAgaves(
    @Param('id') id: number,
    @Body('agaves') agaves: number[], //un array de ids de agaves
    @User() user: JWTPayLoadDTO,
  ): Promise<void> {
    return this.productsService.updateAgaves(id, agaves, user);
  }

  /**
   * Actualiza los sabores de un producto, se verifica que el producto pertenezca
   * a la casa y que los sabores existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} flavors array de ids de los sabores a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/flavors')
  updateProductFlavors(
    @Param('id', ParseIntPipe) id: number,
    @Body('organolepticas') organolepticas: string[], //un array de ids de flavors
    @User() user: JWTPayLoadDTO,
  ): Promise<void> {
    return this.productsService.updateFlavors(id, organolepticas, user);
  }
  /**
   * Actualiza las tiendas de un producto, se verifica que el producto pertenezca
   * a la casa y que las tiendas existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} shops array de ids de las tiendas a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/shops')
  updateProductShops(
    @Param('id') id: number,
    @Body('shops') shops: number[], //un array de ids de flavors
    @User() user: JWTPayLoadDTO,
  ): Promise<void> {
    return this.productsService.updateShops(id, shops, user);
  }

  /**
   * Actualiza el maestro de un producto, se verifica que el producto pertenezca
   * a la casa y que el maestro sea de la casa del usuario que edita
   *
   * @param id id del producto a actualizar
   * @param {number} master id del maestro a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/master')
  updateProductMaster(
    @Param('id') id: number,
    @Body('master') master: number, //un id del master a asignar
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateMaster(id, master, user);
  }
  /**
   * Actualiza el tipo de mezcal de un producto, se verifica que el producto pertenezca
   * a la casa y que el tipo de mezcal exista
   *
   * @param id id del producto a actualizar
   * @param {number} mezcalType id del tipo de mezcal a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/mezcal-type')
  updateProductMezcalType(
    @Param('id') id: number,
    @Body('mezcalType') mezcalType: number, //un id del tipo de mezcal a asignar
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateMezcalType(id, mezcalType, user);
  }
  /**
   * Actualiza los procesos de un producto, se verifica que el producto pertenezca
   * a la casa y que los procesos existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} procesos array de ids de los procesos a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/processes')
  updateProductProcesses(
    @Param('id') id: number,
    @Body('processes') processes: number[], //un array de ids de agaves
    @User() user: JWTPayLoadDTO,
  ): Promise<void> {
    return this.productsService.updateProcesses(id, processes, user);
  }
  /**
   * Actualiza la región de un producto, se verifica que el producto pertenezca
   * a la casa y que la región exista
   *
   * @param id id del producto a actualizar
   * @param {number} region id de la region a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/region')
  updateProductRegion(
    @Param('id') id: number,
    @Body('region') region: number, //un id de la region a asignar
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateRegion(id, region, user);
  }
  /**
   * Actualiza cooking de un producto, se verifica que el producto pertenezca
   * a cooking exista
   *
   * @param id id del producto a actualizar
   * @param {number} cooking id de cooking a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/cooking')
  updateProductCooking(
    @Param('id') id: number,
    @Body('cooking') cooking: number, //un id de la cooking a asignar
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateCooking(id, cooking, user);
  }
  /**
   * Actualiza distilling de un producto, se verifica que el producto pertenezca
   * a distilling exista
   *
   * @param id id del producto a actualizar
   * @param {number} distilling id de distilling a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/distilling')
  updateProductDistilling(
    @Param('id') id: number,
    @Body('distilling') distilling: number, //un id de la distilling a asignar
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateDistilling(id, distilling, user);
  }
  /**
   * Actualiza fermenting de un producto, se verifica que el producto pertenezca
   * a fermenting exista
   *
   * @param id id del producto a actualizar
   * @param {number} fermenting id de fermenting a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/fermenting')
  updateProductFermenting(
    @Param('id') id: number,
    @Body('fermenting') fermenting: number, //un id de la fermenting a asignar
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateFermenting(id, fermenting, user);
  }
  /**
   * Actualiza milling de un producto, se verifica que el producto pertenezca
   * a milling exista
   *
   * @param id id del producto a actualizar
   * @param {number} milling id de milling a relacionar con el producto
   */
  @Rules('update:products')
  @Put('products/:id/milling')
  updateProductMilling(
    @Param('id') id: number,
    @Body('milling') milling: number, //un id de milling a asignar
    @User() user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    return this.productsService.updateMilling(id, milling, user);
  }

  /**
   * Elimina un producto de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * No debe poder borrar productos que no son de su marca/casa
   *
   * @param {number} id el producto a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Rules('delete:products')
  @Delete('products/:id')
  delete(
    @Param('id') id: number,
    @User() user: JWTPayLoadDTO, //obtenemos el user en sesion
  ): Promise<DeleteResult> {
    //se lo pasamos al service para que evalue si el product es de una marca/casa del usuario que intenta borrar
    return this.productsService.delete(id, user);
  }
  /*
  @Rules('view:products')
  @Get('filter')
  filter(
    @Body() productsFilterDto: ProductsFilterDTO,
  ): Promise<ProductEntity[]> {
    return this.productsService.get(productsFilterDto);
  }
  */
  /**
   * Api: GET /api/v1/owner/products/:id
   *
   * No deberiamos poder obtener productos de marcas que no son de mi casa
   *
   * @param {number} id el id del producto a actualizar
   * @returns {ProductDTO} - el producto de la base de datos
   */
  @Rules('view:products')
  @Get('products/:id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ): Promise<ProductEntity> {
    return await this.productsService.getById(id, user);
  }

  /**
   * Api: POST /api/v1/productos/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Rules('view:products')
  @Post('products/paginate')
  paginate(
    @Body() opciones: PaginationPrimeNG,
    @User() user: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    return this.productsService.paginate(opciones, user);
  }

  /**
   * Autoriza el comentario de un usuario, valida que el comentario sea de un
   * producto de una marca del usuario en sesion.
   *
   * @param productId id del producto al que pertenece el comentario
   * @param commentId id del comentario
   * @param user usuario en sesion que autoriza el comentario
   */
  @Put('products/:productId/comment/:commentId/authorize')
  @Rules('update:comments')
  @RequireUser()
  authorizeComment(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.productsService.authorizeComment(productId, commentId, user);
  }

  /**
   * Desautoriza el comentario de un usuario, valida que el comentario sea de un
   * producto de una marca del usuario en sesion.
   *
   * @param productId id del producto al que pertenece el comentario
   * @param commentId id del comentario
   * @param user usuario en sesion que desautoriza el comentario
   */
  @Put('products/:productId/comment/:commentId/deauthorize')
  @Rules('update:comments')
  @RequireUser()
  deAuthorizeComment(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.productsService.authorizeComment(
      productId,
      commentId,
      user,
      false,
    );
  }
}
