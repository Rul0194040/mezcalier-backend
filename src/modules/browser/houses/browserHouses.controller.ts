import { PaginationPrimeNgHouses } from './../../../common/dto/pagination/paginationPrimeHouses.dto';
import { PublicJWTAuthGuard } from '@mezcal/auth/guards/publicJwt.guard';
import { PublicUserGuard } from '@mezcal/auth/guards/publicUser.guard';
import { RequireUser } from '@mezcal/common/decorators/requireUser.decorator';
import { PaginationPrimeNgResult } from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { HousesService } from '@mezcal/modules/owner/houses/houses.service';
import { RateDTO } from '@mezcal/modules/browser/products/dtos/rate.dto';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HouseCommentDTO } from './dtos/houseComment.dto';
import { HouseCommentsEntity } from './models/houseComments.entity';
import { MasterEntity } from '@mezcal/modules/owner/masters/model/master.entity';
import { RatingResponseDTO } from '@mezcal/modules/owner/products/dtos/ratingResponse.dto';
import { UpdateResult } from 'typeorm';

@Controller('browse') // #ATENCION: ojo! aqui la ruta no es browser es browse
@UseGuards(PublicJWTAuthGuard, PublicUserGuard)
export class BrowserHousesController {
  constructor(private readonly housesService: HousesService) {}

  /**
   * Api: POST /api/v1/browse/houses
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('houses/paginate')
  paginateHouses(
    @Body() options: PaginationPrimeNgHouses,
    @User() user?: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    return this.housesService.paginate(options, user);
  }

  /**
   * Api: GET /api/v1/browse/houses/:id
   *
   * @param {number} id el id del producto a actualizar
   * @returns {ProductDTO} - el producto de la base de datos
   */
  @Get('houses/:id')
  getHouseById(
    @Param('id', ParseIntPipe) id: number,
    @User() usuario?: UserEntity,
  ): Promise<HouseEntity> {
    return this.housesService.getById(id, usuario);
  }

  /**
   * Obtener los comentarios de una casa
   *
   * @param id de la casa
   */
  @Get('houses/:id/comments')
  async getHouseCommentsById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HouseCommentsEntity[]> {
    return this.housesService.getCommentsByHouseId(id);
  }

  /**
   * Me gusta una casa
   *
   * @param houseId id de la casa que le gusta
   * @param user usuario al que le gusta la casa (sesion)
   */
  @Put('houses/:id/like')
  @RequireUser()
  async houseLike(
    @Param('id') houseId: number,
    @User() user: UserEntity,
  ): Promise<boolean> {
    return await this.housesService.like(user, houseId);
  }

  /**
   * Dislike a una casa
   * @param houseId id de la casa a la que se dará dislike
   * @param user usuario en sesión
   */
  @Put('houses/:id/dislike')
  @RequireUser()
  async houseDisike(
    @Param('id') houseId: number,
    @User() user: UserEntity,
  ): Promise<boolean> {
    return await this.housesService.dislike(user, houseId);
  }

  /**
   * Rate a una casa
   *
   * @param houseId Id de la casa
   * @param data rating
   * @param user usuario, proviene de sesion
   */
  @Put('houses/:id/rate')
  @RequireUser()
  rateHouse(
    @Param('id') houseId: number,
    @Body() data: RateDTO,
    @User() user: UserEntity,
  ): Promise<RateDTO> {
    return this.housesService.rate(user, houseId, data.rating);
  }

  /**
   * Actualiza el rating de un usuario en una casa
   *
   * @param user Usuario en sesion
   * @param id id de la casa
   * @param rating nuevo rating
   * @returns resultados de la actualizacion
   */
  @Put('houses/:id/rating')
  updateRatingUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body('rating') rating: number,
  ): Promise<UpdateResult> {
    return this.housesService.updateUserRating(id, user, rating);
  }

  /**
   * Comentar sobre una casa
   *
   * @param houseId id de la casa a comentar
   * @param commentData comentario
   * @param user usuario que comenta
   */
  @Put('houses/:id/comment')
  @RequireUser()
  commentHouse(
    @Param('id') houseId: number,
    @Body() commentData: HouseCommentDTO,
    @User() user: UserEntity,
  ): Promise<HouseCommentsEntity> {
    return this.housesService.comment(user, houseId, commentData.comment);
  }

  /**
   * Obtener los maestros mezcaleros de una casa
   *
   * @param id id de la casa
   * @returns {MasterEntity[]} array de maestros mezcaleros
   */

  @Get('houses/:id/masters')
  getMastersByHouse(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MasterEntity[]> {
    return this.housesService.getMastersByHouse(id);
  }

  /**
   * obtiene las casas a las cuales ha dado like un usuario
   * @param user usuario en sesión
   */
  @Get('houses/likes/user')
  getLikesByUser(@User() user: UserEntity): Promise<HouseEntity[]> {
    return this.housesService.getHousesLikedByUser(user);
  }

  /**
   * Obtiene los comentarios en las casas hechos por un usuario
   *
   * @param user usuario en sesion
   * @returns {HouseCommentsEntity[]} Arreglo de los comentarios de casas
   */
  @Get('houses/comments/user')
  getCommentsByUser(@User() user: UserEntity): Promise<HouseCommentsEntity[]> {
    return this.housesService.getCommnetsByUser(user);
  }

  /**
   * Verifica si el usuario en sesion ha hecho rating a una casa
   *
   * @param user usuario en sesion
   * @param id id de la casa
   * @returns true / false dependiendo si ha hecho o no rating de la casa el usuario
   */
  @Get('houses/:id/rating')
  getRatingUser(
    @User() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RatingResponseDTO> {
    return this.housesService.getRatingByUser(user, id);
  }
}
