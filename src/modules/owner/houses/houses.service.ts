import { PaginationPrimeNgHouses } from './../../../common/dto/pagination/paginationPrimeHouses.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { HouseDTO } from '@mezcal/modules/browser/houses/dtos/house.dto';
import { PaginationPrimeNgResult } from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { forIn } from 'lodash';
import { DeleteResult, UpdateResult, getRepository } from 'typeorm';
import { LimitesHouseDTO } from '@mezcal/modules/admin/houses/limitesHouse.dto';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { HouseLikesEntity } from '../../browser/houses/models/houseLikes.entity';
import { RateDTO } from '../../browser/products/dtos/rate.dto';
import { HouseRatingEntity } from '../../browser/houses/models/houseRatings.entity';
import { HouseCommentsEntity } from '../../browser/houses/models/houseComments.entity';
import { MasterEntity } from '../masters/model/master.entity';
import { HousesSortTypes } from '@mezcal/common/enum/housesSortTypes.enum';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { classToPlain } from 'class-transformer';
import { RatingResponseDTO } from '@mezcal/modules/owner/products/dtos/ratingResponse.dto';
/**
 * Service para usuarios
 */
@Injectable()
export class HousesService {
  /**
   * Obtener los comentarios de una casa
   *
   * @param houseId id de la casa
   */
  async getCommentsByHouseId(houseId: number): Promise<HouseCommentsEntity[]> {
    return await getRepository(HouseCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.house', 'house')
      .select([
        'comment.id',
        'comment.comment',
        'comment.createdAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
      ])
      .where('house.id = :houseId', { houseId })
      .getMany();
  }

  /**
   * Activar una casa y su usuario.
   *
   * @param id id de la casa
   * @param {LimitesHouseDTO} limites limites a establecer a la casa
   */

  async authorize(id: number, limites: LimitesHouseDTO): Promise<UpdateResult> {
    //activar la casa y establecer los limites

    await getRepository(HouseEntity)
      .createQueryBuilder()
      .update()
      .set({
        active: true,
        limiteProducts: limites.products,
        limiteBrands: limites.brands,
      })
      .where('id=:id', { id: id })
      .execute();

    const result = await getRepository(UserEntity)
      .createQueryBuilder()
      .update()
      .set({ active: true })
      .where('house=:id', { id: id })
      .execute();

    return result;
  }

  /**
   *
   * Obtener los comentarios de una casa
   * @param user usuario en sesion
   */
  async comments(user): Promise<HouseCommentsEntity[]> {
    const myProduct = getRepository(HouseEntity)
      .createQueryBuilder('house')
      .where('house.id = :houseId', {
        houseId: user.house.id,
      })
      .getOne();

    if (!myProduct) {
      throw new HttpException('La casa no existe', HttpStatus.NOT_FOUND);
    }
    return await getRepository(HouseCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.house', 'house')
      .select(['comment', 'house.id'])
      .where('comment.house = :house AND comment.authorized = :authorized', {
        house: user.house.id,
        authorized: false,
      })
      .getMany();
  }

  async authorizeComment(
    h: number,
    c: number,
    user,
    authorized = true,
  ): Promise<UpdateResult> {
    const commentRepository = getRepository(HouseCommentsEntity);
    const theComment = await commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.house', 'house')
      .where('comment.id = :c AND house.id = :h', {
        c,
        h: user.house.id,
      })
      .getOne();
    if (!theComment) {
      throw new HttpException(
        'El comentario no se encuentra',
        HttpStatus.NOT_FOUND,
      );
    }
    return await commentRepository
      .createQueryBuilder()
      .update()
      .where('id = :id', { id: theComment.id })
      .set({ authorized: authorized })
      .execute();
  }

  /**
   * Obtener las casas
   */
  async get(): Promise<HouseEntity[]> {
    return await getRepository(HouseEntity).find({});
  }

  /**
   * Obtener por id
   *
   */
  async getById(id: number, user?: UserEntity): Promise<any> {
    const theHouse = await getRepository(HouseEntity)
      .createQueryBuilder('house')
      .where('house.id = :id', { id: id })
      .select([
        'house',
        'users',
        'comments',
        'brands',
        'brandImages',
        'brandLogo',
        'images',
      ])
      .leftJoin('house.users', 'users')
      .leftJoin('house.brands', 'brands')
      .leftJoin('brands.images', 'brandImages')
      .leftJoin('brands.logo', 'brandLogo')
      .leftJoin('house.comments', 'comments')
      .leftJoin('house.images', 'images')
      .getOne();

    const theHouse2 = classToPlain(theHouse);

    if (user && !user.house) {
      const isLike = await getRepository(HouseLikesEntity)
        .createQueryBuilder('like')
        .leftJoin('like.house', 'house')
        .leftJoin('like.user', 'user')
        .where('user.id = :userId AND house.id = :houseId', {
          userId: user.id,
          houseId: theHouse.id,
        })
        .getOne();
      if (isLike) {
        theHouse2.isLike = true;
      }
    }

    return theHouse2;
  }
  /**
   * Crear casa
   *
   * @param casa objeto de casa
   */
  async create(casa: HouseDTO): Promise<HouseEntity> {
    const houseToCreate: HouseEntity = new HouseEntity(
      undefined,
      undefined,
      casa.email,
      casa.descripcion,
      casa.html,
      casa.nombre,
      casa.calle,
      casa.estado,
      casa.numExt,
      casa.numInt,
      casa.colonia,
      casa.municipio,
      casa.localidad,
      casa.active,
    );
    return await getRepository(HouseEntity).save(houseToCreate);
  }

  /**
   * Actualizar casa
   *
   * @param id id de la casa
   * @param casa objeto de la casa a actualizar
   */
  async update(
    id: number,
    casa: HouseDTO,
    user: JWTPayLoadDTO,
  ): Promise<HouseEntity> {
    //traemos el anterior, asegurandose que sea de la casa del usuario
    const houseId = user.house ? user.house.id : id;
    const myHouse = await getRepository(HouseEntity)
      .createQueryBuilder()
      .where('id=:houseId', { houseId })
      .getOne();
    if (!myHouse) {
      throw new HttpException('Casa no encontrada', HttpStatus.NOT_FOUND);
    }
    //const casaEntity: HouseEntity = await getRepository(HouseEntity).findOne(id, {});
    //merge con el update
    //const houseToUpdate: HouseEntity = merge(casaEntity, casa);
    //update
    const update = {
      nombre: casa.nombre,
      descripcion: casa.descripcion,
      email: casa.email,
      calle: casa.calle,
      estado: casa.estado,
      numExt: casa.numExt,
      numInt: casa.numInt,
      colonia: casa.colonia,
      municipio: casa.municipio,
      localidad: casa.localidad,
      html: casa.html,
    };
    await getRepository(HouseEntity).update(id, update);
    //find del actualizado
    const data = await getRepository(HouseEntity)
      .createQueryBuilder('house')
      .where('house.id = :id', { id: id })
      .select(['house', 'users'])
      .leftJoin('house.users', 'users')
      .getOne();
    return data;
  }

  /**
   * cambia el estado de una casa
   * @param id id de la casa a actualizar
   * @param active true / false
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return await getRepository(HouseEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('id=:id', { id })
      .execute();
  }

  /**
   * Borrar casa
   *
   * @param id id de la casa
   */
  async delete(id: number): Promise<DeleteResult> {
    return getRepository(HouseEntity).delete(id);
  }
  /**
   * Paginacion de casas.
   *
   * @param options Opciones de paginacion
   */
  async paginate(
    options: PaginationPrimeNgHouses,
    user?: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    const select =
      user && user.house
        ? ['masters', 'images']
        : [
            'house.id',
            'house.nombre',
            'house.email',
            'house.calle',
            'house.numExt',
            'house.numInt',
            'house.colonia',
            'house.municipio',
            'house.localidad',
            'house.estado',
            'house.descripcion',
            'house.limiteBrands',
            'house.limiteProducts',
            'house.rating',
            'house.likes',
            'house.active',
            'images',
          ];
    const dataQuery = getRepository(HouseEntity)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.masters', 'masters')
      .leftJoinAndSelect('house.images', 'images')
      .select(select);

    forIn(options.filters, (value, key) => {
      if (key === 'search') {
        dataQuery.andWhere('house.nombre LIKE :term', {
          term: `%${value.split(' ').join('%')}%`,
        });
      }
    });

    switch (options.sort) {
      case HousesSortTypes.NOMBRE:
        dataQuery.orderBy('house.nombre', 'ASC');
        break;
      case HousesSortTypes.MEJOR_CALIFICADOS:
        dataQuery.orderBy('house.rating', 'DESC');
        break;
      case HousesSortTypes.RECIENTES:
        dataQuery.orderBy('house.createdAt', 'DESC');
        break;
      default:
        break;
    }

    //a los usuarios publicos solo las marcas activas.
    if (user && !user.house) {
      dataQuery.andWhere('house.active = :active', { active: true });
    }

    const count = await dataQuery.getCount();

    const data = await dataQuery
      .skip(options.skip)
      .take(options.take)
      .getMany();

    const data2 = data.map((p) => classToPlain(p));
    //si viene un user y es publico, agregar un true a cada producto que sea su favorito
    if (user && !user.house && data2.length) {
      const houseIds = data2.map((b) => b.id);

      const likes = await getRepository(HouseLikesEntity)
        .createQueryBuilder('liked')
        .leftJoinAndSelect('liked.house', 'house')
        .leftJoinAndSelect('liked.user', 'user')
        .where('user.id = :userId AND house.id IN (:...houseIds)', {
          userId: user.id,
          houseIds,
        })
        .getMany();

      if (likes) {
        likes.forEach((like) => {
          const idx = data2.findIndex((b) => {
            return b.id === like.house.id;
          });
          if (idx > -1) {
            data2[idx].isLike = true;
          }
        });
      }
    }

    return {
      data: data2,
      skip: options.skip,
      totalItems: count,
    };
  }

  /**
   * Me gusta!
   *
   * @param user usuario al que le gusta
   * @param houseId que casa
   */
  async like(user: UserEntity, houseId: number): Promise<boolean> {
    const house = await getRepository(HouseEntity).findOne(houseId);

    if (!house || !house.id) {
      throw new HttpException('No existe la casa.', HttpStatus.NOT_FOUND);
    }
    //si el like ya existe, solo lo regresamos
    const likeExistente = await getRepository(HouseLikesEntity).findOne({
      where: {
        user: user.id,
        house: houseId,
      },
    });

    if (likeExistente && likeExistente.id) {
      return false;
    }

    await getRepository(HouseLikesEntity).save(
      new HouseLikesEntity(user, house),
    );

    //actualizar los likes del producto
    const likesResult = await getRepository(HouseLikesEntity)
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .where({ house: house.id })
      .getRawOne();

    //TODO: trycatch
    await getRepository(HouseEntity)
      .createQueryBuilder()
      .update()
      .set({ likes: likesResult.total })
      .where('id=:id', { id: house.id })
      .execute();
    return true;
  }

  /**
   * dislike a una casa
   * @param user usuario que da dislike
   * @param houseId id de la casa a la cual se da dislike
   */
  async dislike(user: UserEntity, houseId: number): Promise<boolean> {
    const house = await getRepository(HouseEntity).findOne(houseId);

    if (!house || !house.id) {
      throw new HttpException('No existe la casa.', HttpStatus.NOT_FOUND);
    }

    const likeExistente = await getRepository(HouseLikesEntity).findOne({
      where: {
        user: user.id,
        house: houseId,
      },
    });

    // si no existe el like, no podrá dar dislike
    if (!likeExistente) {
      return false;
    }

    await getRepository(HouseLikesEntity).delete(likeExistente.id);

    const deleteResult = await getRepository(HouseLikesEntity)
      .createQueryBuilder('like')
      .leftJoin('like.user', 'user')
      .leftJoin('like.house', 'house')
      .where('user.id = :userId AND house.id = :houseId', {
        userId: user.id,
        houseId,
      })
      .delete()
      .execute();

    if (deleteResult.affected) {
      //actualizar los likes del producto
      const likesResult = await getRepository(HouseLikesEntity)
        .createQueryBuilder()
        .select('COUNT(*)', 'total')
        .where({ house: house.id })
        .getRawOne();

      //TODO: trycatch
      await getRepository(HouseEntity)
        .createQueryBuilder()
        .update()
        .set({ likes: likesResult.total })
        .where('id=:id', { id: house.id })
        .execute();

      return true;
    }
    return false;
  }

  /**
   * Almacena un rating de una casa
   *
   * @param userId id del usario que hace el rating
   * @param productId id de la casa que se le hace rating
   * @param rating score
   */
  async rate(
    user: UserEntity,
    houseId: number,
    rating: number,
  ): Promise<RateDTO> {
    try {
      //obtener la entidad de la casa
      const house = await getRepository(HouseEntity).findOne(houseId);
      if (!house) {
        throw new NotFoundException('house not found');
      }

      const rateExiste = await getRepository(HouseRatingEntity).findOne({
        where: {
          house: house,
          user: user,
        },
      });

      if (rateExiste) {
        return {
          rating: rateExiste.rating,
          affected: 0,
        };
      }

      const newRating = new HouseRatingEntity(user, house, rating);

      //crear el rating
      const createdRating = await getRepository(HouseRatingEntity).save(
        newRating,
      );

      //buscar todos los ratings de esta marca y promediarlos
      const houseRating = await getRepository(HouseRatingEntity)
        .createQueryBuilder()
        .select('AVG(rating)', 'rating')
        .where({ house: house.id })
        .getRawOne();

      //actualizar rating en la marca
      const result = await getRepository(HouseEntity)
        .createQueryBuilder()
        .update()
        .set({ rating: houseRating.rating })
        .where('id=:id', { id: house.id })
        .execute();

      const response: RateDTO = {
        rating: createdRating.rating,
        newRating: houseRating.rating,
        affected: result.affected,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateUserRating(
    id: number,
    user: UserEntity,
    rating: number,
  ): Promise<UpdateResult> {
    await getRepository(HouseRatingEntity)
      .createQueryBuilder('rating')
      .leftJoin('rating.user', 'user')
      .leftJoin('rating.house', 'house')
      .update()
      .set({ rating })
      .where('user.id=:userId AND house.id =:houseId', {
        userId: user.id,
        houseId: id,
      })
      .execute();

    const houseRating = await getRepository(HouseRatingEntity)
      .createQueryBuilder()
      .select('AVG(rating)', 'rating')
      .where({ house: id })
      .getRawOne();

    //actualizar rating en el producto
    return await getRepository(HouseEntity)
      .createQueryBuilder()
      .update()
      .set({ rating: houseRating.rating })
      .where('id=:id', { id })
      .execute();
  }

  /**
   * Guardar un nuevo comentario de una casa
   *
   * @param user usuario que comenta
   * @param houseId id de la casa que recibe el comentario
   * @param comment comentario de texto
   */
  async comment(
    user: UserEntity,
    houseId: number,
    comment: string,
  ): Promise<HouseCommentsEntity> {
    //obtener la entidad de la casa
    const house = await getRepository(HouseEntity).findOne(houseId);

    if (!house) {
      throw new NotFoundException('House not found');
    }
    //crear el comentario
    const newComment = new HouseCommentsEntity(user, house, comment, false);

    return await getRepository(HouseCommentsEntity).save(newComment);
  }

  async getCommnetsByUser(user: UserEntity): Promise<HouseCommentsEntity[]> {
    return await getRepository(HouseCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoinAndSelect('comment.house', 'house')
      .leftJoinAndSelect('house.images', 'images')
      .select([
        'comment',
        'house.id',
        'house.uuid',
        'house.email',
        'house.descripcion',
        'house.nombre',
        'house.calle',
        'house.numExt',
        'house.numInt',
        'house.colonia',
        'house.municipio',
        'house.localidad',
        'house.estado',
        'house.active',
        'house.createdAt',
        'house.rating',
        'house.likes',
        'images',
      ])
      .where('user.id=:userId', { userId: user.id })
      .getMany();
  }

  /**
   * Verifica si el usuario en sesion ha hecho rating a una casa
   *
   * @param user usuario en sesion
   * @param id id de la casa
   * @returns true / false dependiendo si ha hecho o no rating de la casa el usuario
   */
  async getRatingByUser(
    user: UserEntity,
    id: number,
  ): Promise<RatingResponseDTO> {
    const rated = await getRepository(HouseRatingEntity)
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .leftJoinAndSelect('rating.house', 'house')
      .where('user.id=:userId AND house.id =:houseId', {
        userId: user.id,
        houseId: id,
      })
      .getOne();
    if (rated) {
      const response: RatingResponseDTO = {
        existRating: true,
        rating: rated.rating,
      };
      return response;
    }
    const response: RatingResponseDTO = {
      existRating: false,
    };
    return response;
  }

  /**
   * Obtener los maestros mezcaleros de una casa
   *
   * @param {number} houseId el id de la casa
   * @returns {MasterEntity[]} array de maestros mezcaleros
   *
   */
  async getMastersByHouse(houseId: number): Promise<MasterEntity[]> {
    return await getRepository(MasterEntity)
      .createQueryBuilder('master')
      .leftJoinAndSelect('master.images', 'images')
      .where('master.houseId=:houseId', { houseId })
      .getMany();
  }

  /**
   * Obtiene las casa a las que ha dado like un usuario
   * @param user usuario en sesion
   */
  async getHousesLikedByUser(user: UserEntity): Promise<HouseEntity[]> {
    if (!user) {
      throw new HttpException('requiere un usuario', HttpStatus.BAD_REQUEST);
    }

    const likes = await getRepository(HouseLikesEntity)
      .createQueryBuilder('houseLikes')
      .leftJoin('houseLikes.user', 'user')
      .leftJoinAndSelect('houseLikes.house', 'house')
      .where('user.id=:userId', { userId: user.id })
      .select(['houseLikes.id', 'house'])
      .getMany();

    const likesIds = likes.map((l) => l.house.id);

    return await getRepository(HouseEntity)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.images', 'images')
      .select([
        'house.id',
        'house.email',
        'house.descripcion',
        'house.nombre',
        'house.calle',
        'house.numExt',
        'house.numInt',
        'house.colonia',
        'house.municipio',
        'house.localidad',
        'house.estado',
        'house.active',
        'house.limiteBrands',
        'house.limiteProducts',
        'house.rating',
        'house.likes',
        'images',
      ])
      .whereInIds(likesIds)
      .getMany();
  }

  /**
   * Valida si ya ha sido registrado el email en una casa
   *
   * @param email email de la casa a validar
   * @returns { ok: boolean; message: string } false si el correo ya ha sido registrado, true si esta disponible
   */
  async verificateHouse(
    email: string,
  ): Promise<{ ok: boolean; message: string }> {
    const existeEmail = await getRepository(HouseEntity).findOne({ email });
    let message: any;
    if (existeEmail)
      message = {
        ok: false,
        message: 'El email ya ha sido registrado en una casa',
      };
    else
      message = {
        ok: true,
        message: 'El email aun no ha sido registrado en una casa',
      };
    return message;
  }
}
