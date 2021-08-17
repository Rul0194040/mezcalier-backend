import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateResult, DeleteResult, getRepository } from 'typeorm';
import { merge, forIn } from 'lodash';
import { PaginationPrimeNgResult } from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { BrandDTO } from '@mezcal/modules/owner/brands/brand.dto';
import { UserEntity } from '../../admin/users/model/user.entity';
import { BrandLikesEntity } from '../../browser/brands/brandLikes.entity';
import { RateDTO } from '../../browser/products/dtos/rate.dto';
import { BrandRatingEntity } from '../../browser/brands/brandRatings.entity';
import { BrandCommentsEntity } from '../../browser/brands/brandComments.entity';
import { BrandsSortTypes } from '../../../common/enum/brandsSortTypes.enum';
import { PaginationPrimeNgBrands } from '../../../common/dto/pagination/paginationPrimeBrands.dto';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { classToPlain } from 'class-transformer';
import { RatingResponseDTO } from '../products/dtos/ratingResponse.dto';
/**
 * Service para marcas
 */
@Injectable()
export class BrandsService {
  /**
   * Obtener marcas
   */
  async getHouseId(id): Promise<BrandEntity[]> {
    const house = await getRepository(HouseEntity).findOne(id);
    const brands = await getRepository(BrandEntity).find({
      where: { house: house },
    });
    return brands;
  }

  /**
   * Marca por id
   * @param id
   */
  async getById(id: number, user?: UserEntity): Promise<any> {
    const query = getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.comments', 'comments')
      .leftJoinAndSelect('brand.images', 'images')
      .leftJoinAndSelect('brand.house', 'house')
      .leftJoinAndSelect('house.images', 'house.images')
      .leftJoinAndSelect('brand.logo', 'logo')
      .leftJoinAndSelect('brand.products', 'products')
      .where('brand.id = :brandId', { brandId: id });

    //si la consulta es con usuario, solo las marcas de la casa de ese usuario
    if (user && user.house) {
      query.andWhere('house.id = :houseId', { houseId: user.house.id });
    }

    const theBrand = await query.getOne();

    if (theBrand) {
      const theBrand2 = classToPlain(theBrand);
      if (user && !user.house) {
        const isLike = await getRepository(BrandLikesEntity)
          .createQueryBuilder('like')
          .leftJoin('like.brand', 'brand')
          .leftJoin('like.user', 'user')
          .where('user.id = :userId AND brand.id = :brandId', {
            userId: user.id,
            brandId: theBrand.id,
          })
          .getOne();
        if (isLike) {
          theBrand2.isLike = true;
        }
      }
      console.log(theBrand2.images);
      return theBrand2;
    }
    throw new HttpException('No se encuentra esa marca', HttpStatus.NOT_FOUND);
  }

  async getLogoByBrandId(brandId: number) {
    return getRepository(ImageEntity)
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.brandlogo', 'brandlogo')
      .where('brandlogo.id = :brandId', {
        brandId,
      })
      .getOne();
  }

  /**
   * obtiene todos los comentarios de la marca por id
   * @param id id de la marca
   */
  async getCommentsByBrandId(id: number): Promise<BrandEntity> {
    const query = getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .select([
        'brand.id',
        'brand.nombre',
        'brand.descripcion',
        'comments.id',
        'comments.comment',
        'comments.createdAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.picUrl',
      ])
      .leftJoin('brand.comments', 'comments')
      .leftJoin('comments.user', 'user')
      .where('brand.id = :id', { id });

    return await query.getOne();
  }

  /**
   * Obtiene los comentarios de marcas hechas por un usuario
   *
   * @param user usuario en sesion
   * @returns {BrandCommentsEntity[]} lista de Comentarios de marcas con su respectiva marca
   */
  async getCommnetsByUser(user: UserEntity): Promise<BrandCommentsEntity[]> {
    return await getRepository(BrandCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoinAndSelect('comment.brand', 'brand')
      .leftJoinAndSelect('brand.logo', 'logo')
      .leftJoinAndSelect('brand.images', 'images')
      .select([
        'comment',
        'brand.id',
        'brand.uuid',
        'brand.nombre',
        'brand.descripcion',
        'brand.active',
        'brand.createdAt',
        'brand.rating',
        'brand.likes',
        'logo',
        'images',
      ])
      .where('user.id=:userId', { userId: user.id })
      .getMany();
  }

  /**
   * Create
   * @param brandDTO objeto de creacion
   */
  async create(brandDTO: BrandDTO): Promise<BrandEntity> {
    //buscar la casa
    const house: HouseEntity = await getRepository(HouseEntity).findOne({
      where: { id: brandDTO.house },
    });

    const brandToCreate = new BrandEntity(
      undefined,
      undefined,
      brandDTO.nombre,
      brandDTO.descripcion,
      brandDTO.html,
      true,
      house,
    );
    return await getRepository(BrandEntity).save(brandToCreate);
  }

  /**
   * Actualizar marca
   *
   * @param id id de la marca
   * @param brandDTO objeto de actualizacion
   */
  async update(
    id: number,
    brandDTO: BrandDTO,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    let myBrand = await getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoin('brand.house', 'house')
      .where('house.id=:houseId AND brand.id=:brandId', {
        houseId: user.house.id,
        brandId: id,
      })
      .getOne();
    if (!myBrand) {
      throw new HttpException('Marca no encontrada', HttpStatus.NOT_FOUND);
    }

    myBrand = merge(myBrand, brandDTO);
    delete myBrand.house; // como no se va a actualizar house, se pasa undefined al update
    return getRepository(BrandEntity).update(id, myBrand);
  }

  /**
   *
   * actualiza el estado de una marca
   * @param id id de la marca
   * @param active true / false para activar o desactivar
   * @param user usuario en sesion
   */
  async updateStatus(
    id: number,
    active: boolean,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    const myBrand = await getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoin('brand.house', 'house')
      .where('house.id=:houseId AND brand.id=:brandId', {
        houseId: user.house.id,
        brandId: id,
      })
      .getOne();

    if (!myBrand) {
      throw new HttpException('La marca no existe', HttpStatus.NOT_FOUND);
    }

    return await getRepository(BrandEntity)
      .createQueryBuilder()
      .update()
      .set({
        active: active,
      })
      .where('id = :id', { id: myBrand.id })
      .execute();
  }

  /**
   * Borrar marca, solo de la casa del usuario
   *
   * @param id id de la marca
   * @param user quien solicita
   */
  async delete(id: number, user: JWTPayLoadDTO): Promise<DeleteResult> {
    const myBrand = await getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoin('brand.house', 'house')
      .where('brand.id=:brandId AND house.id=:houseId', {
        brandId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myBrand) {
      throw new HttpException('Esa marca no existe', HttpStatus.NOT_FOUND);
    }
    return getRepository(BrandEntity).delete(id);
  }

  /**
   * Paginacion de marcas
   * @param options opciones de paginacion solicitadas
   */
  async paginate(
    options: PaginationPrimeNgBrands,
    user?: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    //si es un owner, mandar toda la info
    const select = user.house
      ? ['brand', 'images', 'logo']
      : //si es publico, limpiar la info
        [
          'brand.id',
          'brand.nombre',
          'brand.descripcion',
          'brand.rating',
          'brand.likes',
          'brand.active',
          'images.id',
          'images.uuid',
          'logo.id',
          'logo.uuid',
        ];
    const dataQuery = getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.images', 'images')
      .leftJoinAndSelect('brand.logo', 'logo')
      .leftJoin('brand.house', 'house')
      .select(select);

    forIn(options.filters, (value, key) => {
      if (key === 'search') {
        dataQuery.andWhere('( brand.nombre LIKE :term )', {
          term: `%${value.split(' ').join('%')}%`,
        });
      }
    });

    switch (options.sort) {
      case BrandsSortTypes.NOMBRE:
        dataQuery.orderBy('brand.nombre', 'ASC');
        break;
      case BrandsSortTypes.MEJOR_CALIFICADOS:
        dataQuery.orderBy('brand.rating', 'DESC');
        break;
      case BrandsSortTypes.RECIENTES:
        dataQuery.orderBy('brand.createdAt', 'DESC');
        break;
      default:
        break;
    }

    // filtrar solo casa de un owner
    if (user && user.house) {
      dataQuery.andWhere('brand.house.id =:houseId', {
        houseId: user.house.id,
      });
    }

    //a los usuarios publicos solo las marcas activas.
    if (user && !user.house) {
      dataQuery.andWhere('brand.active = :active', { active: true });
    }

    const count = await dataQuery.getCount();

    const data = await dataQuery
      .skip(options.skip)
      .take(options.take)
      .getMany();

    const data2 = data.map((p) => classToPlain(p));
    //si viene un user y es publico, agregar un true a cada producto que sea su favorito
    if (user && !user.house && data2.length) {
      const brandIds = data2.map((b) => b.id);

      const likes = await getRepository(BrandLikesEntity)
        .createQueryBuilder('liked')
        .leftJoinAndSelect('liked.brand', 'brand')
        .leftJoinAndSelect('liked.user', 'user')
        .where('user.id = :userId AND brand.id IN (:...brandIds)', {
          userId: user.id,
          brandIds,
        })
        .getMany();

      if (likes) {
        likes.forEach((like) => {
          const idx = data2.findIndex((b) => {
            return b.id === like.brand.id;
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
   * @param brandId que producto
   */
  async like(user: UserEntity, brandId: number): Promise<boolean> {
    const brand = await getRepository(BrandEntity).findOne(brandId);

    if (!brand || !brand.id) {
      throw new HttpException('No existe la marca.', HttpStatus.NOT_FOUND);
    }
    //si el like ya existe, solo lo regresamos
    const likeExistente = await getRepository(BrandLikesEntity).findOne({
      where: {
        user: user.id,
        brand: brandId,
      },
    });

    if (likeExistente && likeExistente.id) {
      return false;
    }

    await getRepository(BrandLikesEntity).save(
      new BrandLikesEntity(user, brand),
    );

    //actualizar los likes del producto
    const likesResult = await getRepository(BrandLikesEntity)
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .where({ brand: brand.id })
      .getRawOne();

    //TODO: trycatch
    await getRepository(BrandEntity)
      .createQueryBuilder()
      .update()
      .set({ likes: likesResult.total })
      .where('id=:id', { id: brand.id })
      .execute();
    return true;
  }

  /**
   * Dislike a la marca
   * @param user usuario sesion
   * @param brandId id de la marca a la cual se dará dislike
   */
  async dislike(user: UserEntity, brandId: number): Promise<boolean> {
    const brand = await getRepository(BrandEntity).findOne(brandId);

    if (!brand || !brand.id) {
      throw new HttpException('No existe la marca.', HttpStatus.NOT_FOUND);
    }

    const likeExistente = await getRepository(BrandLikesEntity).findOne({
      where: {
        user: user.id,
        brand: brandId,
      },
    });

    // si no existe like no puede dar dislike
    if (!likeExistente) {
      return false;
    }

    const deleteResult = await getRepository(BrandLikesEntity)
      .createQueryBuilder('like')
      .leftJoin('like.user', 'user')
      .leftJoin('like.brand', 'brand')
      .where('user.id=:userId AND brand.id = :brandId', {
        userId: user.id,
        brandId,
      })
      .delete()
      .execute();

    if (deleteResult.affected) {
      //actualizar los likes del producto
      const likesResult = await getRepository(BrandLikesEntity)
        .createQueryBuilder()
        .select('COUNT(*)', 'total')
        .where({ brand: brand.id })
        .getRawOne();

      //TODO: trycatch
      await getRepository(BrandEntity)
        .createQueryBuilder()
        .update()
        .set({ likes: likesResult.total })
        .where('id=:id', { id: brand.id })
        .execute();

      return true;
    }
    return false;
  }

  /**
   * Obtiene las marcas a las que ha dado like un usuario
   * @param user usuario en sesión
   */
  async getBrandsLikedByUser(user: UserEntity): Promise<BrandEntity[]> {
    if (!user) {
      throw new HttpException('requiere un usuario', HttpStatus.BAD_REQUEST);
    }

    const likes = await getRepository(BrandLikesEntity)
      .createQueryBuilder('brandLikes')
      .leftJoin('brandLikes.user', 'user')
      .leftJoinAndSelect('brandLikes.brand', 'brand')
      .where('user.id=:userId', { userId: user.id })
      .select(['brandLikes.id', 'brand'])
      .getMany();

    const likesIds = likes.map((l) => l.brand.id);

    return await getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.logo', 'logo')
      .leftJoinAndSelect('brand.images', 'images')
      .select([
        'brand.id',
        'brand.nombre',
        'brand.descripcion',
        'brand.active',
        'brand.rating',
        'brand.likes',
        'logo',
        'images',
      ])
      .whereInIds(likesIds)
      .getMany();
    /*  return await getRepository(BrandLikesEntity)
      .createQueryBuilder('brandLikes')
      .leftJoin('brandLikes.user', 'user')
      .leftJoinAndSelect('brandLikes.brand', 'brand')
      .leftJoinAndSelect('brand.logo', 'logo')
      .leftJoinAndSelect('brand.images', 'images')
      .where('user.id=:userId', { userId: user.id })
      .select(['brandLikes.id', 'brand', 'logo', 'images'])
      .getMany(); */
  }

  /**
   * Almacena un rating de una marca
   *
   * @param userId id del usario que hace el rating
   * @param productId id de la marca que se le hace rating
   * @param rating score
   */
  async rate(
    user: UserEntity,
    brandId: number,
    rating: number,
  ): Promise<RateDTO> {
    try {
      //obtener la entidad de la marca
      const brand = await getRepository(BrandEntity).findOne(brandId);
      if (!brand) {
        throw new NotFoundException('brand not found');
      }

      const rateExiste = await getRepository(BrandRatingEntity).findOne({
        where: {
          brand: brand,
          user: user,
        },
      });

      if (rateExiste) {
        const response: RateDTO = {
          rating: rateExiste.rating,
          affected: 0,
        };
        return response;
      }

      const newRating = new BrandRatingEntity(user, brand, rating);

      const createdRating = await getRepository(BrandRatingEntity).save(
        newRating,
      );

      //buscar todos los ratings de esta marca y promediarlos
      const brandRating = await getRepository(BrandRatingEntity)
        .createQueryBuilder()
        .select('AVG(rating)', 'rating')
        .where({ brand: brand.id })
        .getRawOne();

      //actualizar rating en la marca
      const result = await getRepository(BrandEntity)
        .createQueryBuilder()
        .update()
        .set({ rating: brandRating.rating })
        .where('id=:id', { id: brand.id })
        .execute();

      const response: RateDTO = {
        rating: createdRating.rating,
        newRating: brandRating.rating,
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
    await getRepository(BrandRatingEntity)
      .createQueryBuilder('rating')
      .leftJoin('rating.user', 'user')
      .leftJoin('rating.brand', 'brand')
      .update()
      .set({ rating })
      .where('user.id=:userId AND brand.id =:brandId', {
        userId: user.id,
        brandId: id,
      })
      .execute();

    const brandRating = await getRepository(BrandRatingEntity)
      .createQueryBuilder()
      .select('AVG(rating)', 'rating')
      .where({ brand: id })
      .getRawOne();

    return await getRepository(BrandEntity)
      .createQueryBuilder()
      .update()
      .set({ rating: brandRating.rating })
      .where('id=:id', { id })
      .execute();
  }

  /**
   * Guardar un nuevo comentario de una marca
   *
   * @param user usuario que comenta
   * @param brandId id de la marca que recibe el comentario
   * @param comment comentario de texto
   */
  async comment(
    user: UserEntity,
    brandId: number,
    comment: string,
  ): Promise<BrandCommentsEntity> {
    //obtener la entidad de la marca
    const brand = await getRepository(BrandEntity).findOne(brandId);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    //crear el comentario
    const newComment = new BrandCommentsEntity(user, brand, comment, false);

    return await getRepository(BrandCommentsEntity).save(newComment);
  }
  /**
   * Listar comentarios de una marca
   *
   * @param user usuario de sesión
   */
  async comments(user): Promise<BrandCommentsEntity[]> {
    const myBrand = getRepository(HouseEntity)
      .createQueryBuilder('house')
      .where('house.id = :houseId', {
        houseId: user.house.id,
      })
      .getOne();

    if (!myBrand) {
      throw new HttpException('La casa no existe', HttpStatus.NOT_FOUND);
    }
    return await getRepository(BrandCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .select(['comment', 'brand.id'])
      .where('house.id = :houseId AND comment.authorized = :authorized', {
        houseId: user.house.id,
        authorized: false,
      })
      .getMany();
  }

  async authorizeComment(
    b: number,
    c: number,
    user,
    authorized = true,
  ): Promise<UpdateResult> {
    const commentRepository = getRepository(BrandCommentsEntity);
    const theComment = await commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('comment.id = :c AND brand.id = :b AND house.id = :h', {
        c,
        b,
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
   * Verifica si el usuario en sesion ha hecho rating a una marca
   *
   * @param user usuario en sesion
   * @param id id de la marca
   * @returns true / false dependiendo si ha hecho o no rating de la marca el usuario
   */
  async getRatingByUser(
    user: UserEntity,
    id: number,
  ): Promise<RatingResponseDTO> {
    const rated = await getRepository(BrandRatingEntity)
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .leftJoinAndSelect('rating.brand', 'brand')
      .where('user.id=:userId AND brand.id =:brandId', {
        userId: user.id,
        brandId: id,
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
}
