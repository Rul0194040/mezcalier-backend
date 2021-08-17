import { PublicJWTAuthGuard } from '@mezcal/auth/guards/publicJwt.guard';
import { PublicUserGuard } from '@mezcal/auth/guards/publicUser.guard';
import { RequireUser } from '@mezcal/common/decorators/requireUser.decorator';
import { PaginationPrimeNgResult } from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { BrandCommentDTO } from '@mezcal/modules/browser/brands/brandComment.dto';
import { BrandCommentsEntity } from '@mezcal/modules/browser/brands/brandComments.entity';
import { BrandsService } from '@mezcal/modules/owner/brands/brands.service';
import { HousesService } from '@mezcal/modules/owner/houses/houses.service';
import { RateDTO } from '@mezcal/modules/browser/products/dtos/rate.dto';
import { ProductsService } from '@mezcal/modules/owner/products/products.service';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { PaginationPrimeNgBrands } from '../../../common/dto/pagination/paginationPrimeBrands.dto';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Response,
} from '@nestjs/common';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { ImagesService } from '@mezcal/common/images/images.service';
import { RatingResponseDTO } from '@mezcal/modules/owner/products/dtos/ratingResponse.dto';
import { UpdateResult } from 'typeorm';

@Controller('browse') // #ATENCION: ojo! aqui la ruta no es browser es browse
@UseGuards(PublicJWTAuthGuard, PublicUserGuard)
export class BrowserBrandsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly brandsService: BrandsService,
    private readonly housesService: HousesService,
    private readonly imagesService: ImagesService,
  ) {}

  /**
   * Api: POST /api/v1/browse/brands
   *
   * @param {PaginationPrimeNgBrands} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('brands/paginate')
  paginateBrands(
    @Body() options: PaginationPrimeNgBrands,
    @User() user?: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    return this.brandsService.paginate(options, user);
  }

  /**
   * Api: GET /api/v1/browse/brands/:id
   *
   * @param {number} id el id del producto a actualizar
   * @returns {ProductDTO} - el producto de la base de datos
   */
  @Get('brands/:id')
  getBrandById(
    @Param('id', ParseIntPipe) id: number,
    @User() usuario?: UserEntity,
  ): Promise<BrandEntity> {
    return this.brandsService.getById(id, usuario);
  }

  /**
   * Me gusta una marca
   *
   * @param brandId id de la marca que le gusta
   * @param user usuario al que le gusta la marca (sesion)
   */
  @Put('brands/:id/like')
  @RequireUser()
  async brandLike(
    @Param('id') brandId: number,
    @User() user: UserEntity,
  ): Promise<boolean> {
    return await this.brandsService.like(user, brandId);
  }

  /**
   * Dislike de una marca
   * @param brandId id de la marca a dar dislike
   * @param user usuario en sesion
   */
  @Put('brands/:id/dislike')
  @RequireUser()
  async brandDislike(
    @Param('id') brandId: number,
    @User() user: UserEntity,
  ): Promise<boolean> {
    return await this.brandsService.dislike(user, brandId);
  }

  /**
   * obtiene las marcas a las que ha dado like un usuario
   * @param user usuario en sesión
   */
  @Get('brands/likes/user')
  getLikesByUser(@User() user: UserEntity): Promise<BrandEntity[]> {
    return this.brandsService.getBrandsLikedByUser(user);
  }

  /**
   * Rate a marcas
   *
   * @param brandId id de la marca
   * @param data rating
   * @param user usuario, proviene de sesion
   */
  @Put('brands/:id/rate')
  @RequireUser()
  rateBrand(
    @Param('id') brandId: number,
    @Body() data: RateDTO,
    @User() user: UserEntity,
  ): Promise<RateDTO> {
    return this.brandsService.rate(user, brandId, data.rating);
  }

  /**
   * Actualiza el rating de un usuario en una marca
   *
   * @param user Usuario en sesion
   * @param id id de la marca
   * @param rating nuevo rating
   * @returns resultados de la actualizacion
   */
  @Put('brands/:id/rating')
  updateRatingUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body('rating') rating: number,
  ): Promise<UpdateResult> {
    return this.brandsService.updateUserRating(id, user, rating);
  }

  /**
   * Comentar sobre una marca
   *
   * @param houseId id de la marca a comentar
   * @param commentData comentario
   * @param user usuario que comenta
   */
  @Put('brands/:id/comment')
  @RequireUser()
  commentBrand(
    @Param('id') brandId: number,
    @Body() commentData: BrandCommentDTO,
    @User() user: UserEntity,
  ): Promise<BrandCommentsEntity> {
    return this.brandsService.comment(user, brandId, commentData.comment);
  }

  /**
   * Obtiene todos los comentarios de una marca por id
   * @param id id de la marca
   */
  @Get('brands/:id/comments')
  getCommnetsById(@Param('id', ParseIntPipe) id: number): Promise<BrandEntity> {
    return this.brandsService.getCommentsByBrandId(id);
  }

  /**
   * Obtiene los comentarios de marcas hechos por un usuario
   *
   * @param user usuario en sesion
   * @returns {BrandCommentsEntity[]} lista de comentarios con sus marcas
   */
  @Get('brands/comments/user')
  getCommentsByUser(@User() user: UserEntity): Promise<BrandCommentsEntity[]> {
    return this.brandsService.getCommnetsByUser(user);
  }

  @Get('brands/:id/logo')
  async getLogoById(
    @Param('id', ParseIntPipe) id: number,
    @Response() res,
  ): Promise<ImageEntity> {
    const imageRow = await this.brandsService.getLogoByBrandId(id);
    if (!imageRow) {
      throw new HttpException('La marca no se encuentra', HttpStatus.NOT_FOUND);
    }

    const image = await this.imagesService.get(imageRow.uuid);

    if (!image) {
      throw new HttpException(
        'La imagen no se encuentra',
        HttpStatus.NOT_FOUND,
      );
    }

    return res.sendFile(image, { root: `./` });
  }

  /**
   * Verifica si el usuario en sesion ha hecho rating a una marca
   *
   * @param user usuario en sesion
   * @param id id de la marca
   * @returns true / false dependiendo si ha hecho o no rating de la marca el usuario
   */
  @Get('brands/:id/rating')
  getRatingUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RatingResponseDTO> {
    return this.brandsService.getRatingByUser(user, id);
  }
}
