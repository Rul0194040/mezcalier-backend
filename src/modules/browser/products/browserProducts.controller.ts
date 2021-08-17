import { PublicJWTAuthGuard } from '@mezcal/auth/guards/publicJwt.guard';
import { PublicUserGuard } from '@mezcal/auth/guards/publicUser.guard';
import { RequireUser } from '@mezcal/common/decorators/requireUser.decorator';
import { PaginationPrimeNgResult } from '@mezcal/common/dto/pagination/paginationprimeng.dto';
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
} from '@nestjs/common';
import { ProductEntity } from '../../product.entity';
import { ProductCommentDTO } from './dtos/productComment.dto';
import { ProductTastingDTO } from './dtos/productTasting.dto';
import { ProductTastingsEntity } from '../models/productTastings.entity';
import { RateDTO } from './dtos/rate.dto';
import { ProductsService } from '../../owner/products/products.service';
import { UserEntity } from '../../admin/users/model/user.entity';
import { User } from '../../admin/users/user.decorator';
import { CompareProductsDTO } from './dtos/compareProducts.dto';
import { ProductCommentsEntity } from '../models/productComments.entity';
import { ProductFavoritesEntity } from '../models/productFavorites.entity';
import { PaginationPrimeNgProducts } from '@mezcal/common/dto/pagination/paginationPrimeProducts.dto';
import { LoginIdentityDTO } from '@mezcal/auth/dto/loginIdentity.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { diskStorage } from 'multer';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { existsSync, mkdirSync } from 'fs';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { ImagesService } from '../../../common/images/images.service';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';
import { RatingResponseDTO } from '../../owner/products/dtos/ratingResponse.dto';
/**
 * Controller para el publico con la funcionalidad de productos
 */
@Controller('browse') // #ATENCION: ojo! aqui la ruta no es browser es browse
@UseGuards(PublicJWTAuthGuard, PublicUserGuard)
export class BrowserProductsController {
  /**
   * @ignore
   */
  constructor(
    private readonly productsService: ProductsService,
    private readonly imagesService: ImagesService,
    private readonly cloudVisionService: CloudvisionService,
  ) {}

  /**
   * Retorna un array de productos completos para que el front lo renderize a manera de tabla comparativa de productos.
   *
   * @param {number[]} productsIds array de ids de productos a comparar
   * @returns {ProductEntity[]} array de productos.
   */
  @Post('products/compare')
  async compare(
    @Body() productsIds: CompareProductsDTO,
  ): Promise<ProductEntity[]> {
    return await this.productsService.compare(productsIds);
  }

  /**
   * Api: POST /api/v1/browse/products
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('products/paginate')
  paginateProducts(
    @Body() options: PaginationPrimeNgProducts,
    @User() user?: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    return this.productsService.paginate(options, user);
  }

  /**
   * Api: GET /api/v1/browse/products/:id
   *
   * @param {number} id el id del producto a actualizar
   * @returns {ProductDTO} - el producto de la base de datos
   */
  @Get('products/:id')
  getProductById(
    @Param('id', ParseIntPipe) id: number,
    @User() user?: UserEntity,
  ): Promise<ProductEntity> {
    return this.productsService.getById(id, user);
  }

  /**
   * Genera un rating del producto por usario
   *
   * @param id id del producto a hacer rating
   * @param data parametros del rating
   */

  @Put('products/:id/rate')
  @RequireUser()
  rateProduct(
    @Param('id') productId: number,
    @Body() data: RateDTO,
    @User() user: UserEntity,
  ): Promise<RateDTO> {
    return this.productsService.rate(user, productId, data.rating);
  }

  /**
   * Comentar sobre un producto
   *
   * @param productId id del producto a comentar
   * @param commentData cometnario
   * @param user usuario que comenta
   */
  @Put('products/:id/comment')
  @RequireUser()
  comment(
    @Param('id') productId: number,
    @Body() commentData: ProductCommentDTO,
    @User() user: UserEntity,
  ): Promise<ProductCommentsEntity> {
    return this.productsService.comment(user, productId, commentData.comment);
  }

  /**
   * Prueba/degustacion de un producto
   *
   * @param productId id del producto a degustar
   * @param experienceData experiencia
   * @param user usuario que comenta
   */
  @Put('products/:id/taste')
  @RequireUser()
  taste(
    @Param('id') productId: number,
    @Body() experienceData: ProductTastingDTO,
    @User() user: UserEntity,
  ): Promise<ProductTastingsEntity> {
    return this.productsService.taste(
      user,
      productId,
      experienceData.experience,
    );
  }

  /**
   * Elimina una degustacion
   *
   * @param id id de la degustacion
   * @param user usuario en sesion
   * @returns {DeleteResult} resultados de la eliminacion
   */
  @Delete('products/taste/:id')
  @RequireUser()
  deleteTaste(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    return this.productsService.deleteTaste(id, user);
  }

  /**
   * obtiene los productos a los cuales ha dado like un usuario
   * @param user usuario en sesion
   */
  @Get('products/likes/user')
  @RequireUser()
  async getLikesByUser(@User() user: UserEntity): Promise<ProductEntity[]> {
    return await this.productsService.getProductsLikedByUser(user);
  }

  /**
   * Me gusta un producto
   *
   * @param productId id del producto que le gusta
   * @param user usuario al que le gusta el producto (sesion)
   */
  @Put('products/:id/like')
  @RequireUser()
  async like(
    @Param('id') productId: number,
    @User() user: UserEntity,
  ): Promise<boolean> {
    return await this.productsService.like(user, productId);
  }

  /**
   * Ya no me gusta un producto
   *
   * @param productId id del producto que le gusta
   * @param user usuario al que ya no le gusta el producto (sesion)
   */
  @Put('products/:id/dislike')
  @RequireUser()
  async dislike(
    @Param('id') productId: number,
    @User() user: UserEntity,
  ): Promise<boolean> {
    return await this.productsService.dislike(user, productId);
  }

  /**
   * Agrgar un producto a "mis favoritos"
   *
   * @param productId id del producto que se agrega
   * @param user usuario que agrega el producto (sesion)
   */

  @Put('products/:id/favorite')
  @RequireUser()
  async addProductToFavorites(
    @Param('id') productId: number,
    @User() user: LoginIdentityDTO,
  ): Promise<boolean> {
    return await this.productsService.addToFavorites(user, productId);
  }

  /**
   * Quitar un producto de "mis favoritos"
   *
   * @param productId id del producto que se quita
   * @param user usuario que quita el producto (sesion)
   */
  @Put('products/:id/unfavorite')
  @RequireUser()
  async removeProductFromFavorites(
    @Param('id') productId: number,
    @User() user: LoginIdentityDTO,
  ): Promise<boolean> {
    return await this.productsService.removeFromFavorites(user, productId);
  }

  /**
   * Ver "mis favoritos"
   *
   * @param user usuario que consulta (sesion)
   */

  @Put('products/getFavorites')
  @RequireUser()
  getMyFavorites(@User() user: UserEntity): Promise<ProductFavoritesEntity[]> {
    return this.productsService.getFavorites(user);
  }

  /**
   * Obtener los comentarios de un producto
   *
   * @param id id del producto
   */
  @Get('products/:id/comments')
  getCommentsByProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductCommentsEntity[]> {
    return this.productsService.getCommentsByProduct(id);
  }

  /**
   * obtiene degustaciones por usuario
   *
   * @param user usuario en sesion
   * @returns {ProductTastingsEntity[]} lista de degustaciones
   */
  @Put('products/tastings')
  @RequireUser()
  getTastingsByUser(@User() user: UserEntity): Promise<any> {
    return this.productsService.getTastingsByUser(user);
  }

  /**
   * Obtiene los comentarios hechos en productos por un usuario
   *
   * @param user usuario en sesion
   * @returns {ProductCommentsEntity[]} Array de comentarios de un producto con el producto
   */
  @Get('products/comments/user')
  getCommentsByUser(
    @User() user: UserEntity,
  ): Promise<ProductCommentsEntity[]> {
    return this.productsService.getCommentsByUser(user);
  }

  /**
   * obtener las degustaciones por id del producto
   * @param id id del producto
   */
  @Get('products/:id/tasting')
  getTastingByProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getTastingByProductId(id);
  }

  /**
   * Verifica si el usuario en sesion ha hecho rating a un producto
   *
   * @param user usuario en sesion
   * @param id id del producto
   * @returns true / false dependiendo si ha hecho o no rating del producto el usuario
   */
  @Get('products/:id/rating')
  getRatingUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RatingResponseDTO> {
    return this.productsService.getUserRate(id, user);
  }

  /**
   * Actualiza el rating de un usuario en un producto
   *
   * @param user Usuario en sesion
   * @param id id del producto
   * @param rating nuevo rating
   * @returns resultados de la actualizacion
   */
  @Put('products/:id/rating')
  updateRatingUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body('rating') rating: number,
  ): Promise<UpdateResult> {
    return this.productsService.updateUserRating(id, user, rating);
  }

  /**
   * Guarda una imagen de la degustacion
   *
   * @param file imagen
   * @param data informacion de la imagen
   * @param id id de la degustacion
   * @returns {ImageEntity} imagen guardada
   */
  @Post('products/tasting/:id/image')
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

        const tasting = await getRepository(ProductTastingsEntity)
          .createQueryBuilder('tasting')
          .where('tasting.id=:id', { id: req.params.id })
          .getOne();

        if (!tasting) {
          return cb(
            new HttpException('la degustacion no existe', HttpStatus.NOT_FOUND),
            false,
          );
        }

        return cb(null, true);
      },
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dirPath = `./uploads/${ImageTypes.productTasting}/${req.params.id}/`;
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
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ImageEntity> {
    const data: SaveImageDTO = {
      title: '',
      description: '',
      parent: id,
      type: ImageTypes.productTasting,
    };
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
   * Buscar productos por imagen
   *
   * @param file imagen
   * @returns {ImageEntity} imagen guardada
   */
  @Post('products/findByImage')
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
        return cb(null, true);
      },
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dirPath = `./uploads/searchs/`;
          if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
          }
          cb(null, dirPath);
        },
      }),
    }),
  )
  async searchByImage(
    @UploadedFile() file: FileResultDTO,
  ): Promise<{
    products: ProductEntity[];
    scores: any;
  }> {
    const results = await this.cloudVisionService.getSimilarProductsFile(
      file.path,
    );

    //al final regresamos vacio si es que no hay resultados
    let products: ProductEntity[] = [];
    let googleProducts: any;
    //hubo resultados?
    if (
      results &&
      results.responses &&
      results.responses.length &&
      results.responses[0] &&
      results.responses[0].productSearchResults &&
      results.responses[0].productSearchResults.results &&
      results.responses[0].productSearchResults.results.length
    ) {
      //mapearlos a un array.
      googleProducts = results.responses[0].productSearchResults.results.map(
        (r) => {
          return {
            id: parseInt(
              r.product.name.substring(r.product.name.lastIndexOf('/') + 1),
            ),
            score: r.score,
          };
        },
      );

      products = await this.productsService.compare({
        productsIds: googleProducts.map((p) => p.id),
      });
    }

    return { products, scores: googleProducts };
  }
}
