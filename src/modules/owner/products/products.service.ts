import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { PaginationPrimeNgResult } from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { forIn } from 'lodash';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { createProductDTO } from '@mezcal/modules/owner/products/dtos/createProduct.dto';
import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { ProductRatingEntity } from '../../browser/models/productRatings.entity';
import { RateDTO } from '../../browser/products/dtos/rate.dto';
import { UserEntity } from '../../admin/users/model/user.entity';
import { RegionEntity } from '../../admin/catalogs/regions/model/region.entity';
import { CompareProductsDTO } from '../../browser/products/dtos/compareProducts.dto';
import { ProductTastingsEntity } from '../../browser/models/productTastings.entity';
import { ProductsFilterDTO } from './dtos/productsFilter.dto';
import { ProductCommentsEntity } from '../../browser/models/productComments.entity';
import { ProductFavoritesEntity } from '../../browser/models/productFavorites.entity';
import { ProductLikesEntity } from '../../browser/models/productLikes.entity';
import { MasterEntity } from '../masters/model/master.entity';
import { PaginationPrimeNgProducts } from '@mezcal/common/dto/pagination/paginationPrimeProducts.dto';
import { SortTypes } from '@mezcal/common/enum/sortTypes.enum';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { UpdateProductDTO } from './dtos/updateProduct.dto';
import { classToPlain } from 'class-transformer';
import { CookingEntity } from '@mezcal/modules/admin/catalogs/cooking/cooking.entity';
import { MillingEntity } from '@mezcal/modules/admin/catalogs/milling/milling.entity';
import { DistillingEntity } from '@mezcal/modules/admin/catalogs/distilling/distilling.entity';
import { FermentingEntity } from '@mezcal/modules/admin/catalogs/fermenting/fermenting.entity';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { RatingResponseDTO } from './dtos/ratingResponse.dto';
/**
 * Service para usuarios
 */
@Injectable()
export class ProductsService {
  //TODO: Va en el browser
  async compare(ids: CompareProductsDTO): Promise<ProductEntity[]> {
    return await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'productImages')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.logo', 'brandLogo')
      .leftJoinAndSelect('product.region', 'region')
      .leftJoinAndSelect('product.mezcalType', 'mezcalType')
      .leftJoinAndSelect('product.flavors', 'flavors')
      .leftJoinAndSelect('product.processes', 'processes')
      .leftJoinAndSelect('product.agaves', 'agaves')
      .leftJoinAndSelect('product.master', 'master')
      .leftJoinAndSelect('product.cooking', 'cooking')
      .leftJoinAndSelect('product.milling', 'milling')
      .leftJoinAndSelect('product.distilling', 'distilling')
      .leftJoinAndSelect('product.fermenting', 'fermenting')
      .leftJoinAndSelect('product.aromas', 'aromas')
      .select([
        'product.id',
        'product.uuid',
        'product.nombre',
        'product.descripcion',
        'product.html',
        'product.rating',
        'product.likes',
        'product.price',
        'product.colorAspect',
        'product.agingMaterial',
        'product.agingTime',
        'product.alcoholVolume',
        'product.distillingsNumber',
        'product.ltProduced',
        'product.score',
        'product.createdAt',
        'productImages',
        'brand.id',
        'brand.uuid',
        'brand.nombre',
        'brand.descripcion',
        'brandLogo',
        'region.id',
        'region.nombre',
        'region.descripcion',
        'mezcalType.id',
        'mezcalType.nombre',
        'mezcalType.descripcion',
        'processes.id',
        'processes.nombre',
        'processes.descripcion',
        'flavors.id',
        'flavors.nombre',
        'agaves.id',
        'agaves.nombre',
        'agaves.descripcion',
        'master.id',
        'master.nombre',
        'master.descripcion',
        'master.html',
        'cooking.id',
        'cooking.nombre',
        'cooking.descripcion',
        'milling.id',
        'milling.nombre',
        'milling.descripcion',
        'distilling.id',
        'distilling.nombre',
        'distilling.descripcion',
        'fermenting.id',
        'fermenting.nombre',
        'fermenting.descripcion',
        'aromas.id',
        'aromas.nombre',
        'aromas.html',
      ])
      .where('product.id IN (:...ids)', { ids: ids.productsIds })
      .getMany();
  }

  /**
   * Obtener el listado de productos
   * TODO: esto deberia regresar los productos tambien por marca, casa, etc
   *
   */
  async get(filters: ProductsFilterDTO): Promise<ProductEntity[]> {
    //asegurarnos que la marca, pertenece al usaurio

    const { search, brand, house } = filters;

    const productsQuery = getRepository(ProductEntity).createQueryBuilder(
      'product',
    );

    if (house) {
      //traer todas las marcas de esta casa
      const brands = await getRepository(BrandEntity).find({
        where: { house: house },
        select: ['id'],
      }); //[{id:1,id:2,id:3}]

      const brandsIds = brands.map((brand) => brand.id); //[1,2,3]

      productsQuery.andWhere('product.brandId IN (:...brands)', {
        brands: brandsIds,
      });
    }

    if (brand) {
      productsQuery.andWhere('product.brandId = :brand', { brand });
    }

    if (search) {
      productsQuery.andWhere(
        '(product.nombre LIKE :search OR product.description LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    return await productsQuery.getMany();
  }
  /**
   *
   * actualiza el estado de un producto
   * @param id id de la marca
   * @param active true / false para activar o desactivar
   * @param user usuario en sesion
   */
  async updateStatus(
    id: number,
    active: boolean,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    const myProduct = getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();

    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }

    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        active: active,
      })
      .where('id = :id', { id: (await myProduct).id })
      .execute();
  }

  /**
   * Obtener el producto por id, si hay usuario, solo si es producto de una marca de esa casa
   *
   * @param id
   */
  async getById(id: number, user?: UserEntity): Promise<any> {
    let select = [];
    !user.house
      ? (select = [
        'product.id',
        'product.uuid',
        'product.createdAt',
        'product.nombre',
        'product.descripcion',
        'product.html',
        'product.score',
        'product.rating',
        'product.price',
        'product.likes',
        'product.colorAspect',
        'product.agingMaterial',
        'product.agingTime',
        'product.alcoholVolume',
        'product.distillingsNumber',
        'product.ltProduced',
        'product.organolepticas',
        'master.id',
        'master.nombre',
        'master.descripcion',
        'master.html',
        'master.images.id',
        'master.images.uuid',
        'master.images.title',
        'master.images.description',
        'region.id',
        'region.nombre',
        'region.descripcion',
        'region.lat',
        'region.lng',
        'region.altitude',
        'region.html',
        'brand.id',
        'brand.uuid',
        'brand.nombre',
        'brand.descripcion',
        'brand.html',
        'brand.houseId',
        'brand.images.id',
        'brand.images.uuid',
        'brand.logo.id',
        'brand.logo.uuid',
        'agaves.id',
        'agaves.nombre',
        'agaves.descripcion',
        'agaves.html',
        'processes.id',
        'processes.nombre',
        'processes.descripcion',
        'processes.html',
        'flavors.id',
        'flavors.nombre',
        'shops.id',
        'shops.nombre',
        'shops.descripcion',
        'mezcalType.id',
        'mezcalType.nombre',
        'aromas',
        'cooking.id',
        'cooking.nombre',
        'cooking.descripcion',
        'milling.id',
        'milling.nombre',
        'milling.descripcion',
        'distilling.id',
        'distilling.nombre',
        'distilling.descripcion',
        'fermenting.id',
        'fermenting.nombre',
        'fermenting.descripcion',
        'images.id',
        'images.title',
        'images.uuid',
        'images.description',
        'comments.id',
        'comments.comment',
        'comments.authorized',
        'comments.user.id',
        'comments.user.firstName',
        'comments.user.lastName',
        'comments.user.picUrl',
        'comments.createdAt',
        'userLikes.id',
        'userLikes.users.id',
        'userLikes.users.firstName',
        'userLikes.users.lastName',
        'userLikes.users.picUrl',
        'userLikes.createdAt',
        'userFaves.id',
        'userFaves.users.id',
        'userFaves.users.firstName',
        'userFaves.users.lastName',
        'userFaves.users.picUrl',
        'userFaves.createdAt',
      ])
      : (select = [
        'product',
        'master',
        'region',
        'brand',
        'agaves',
        'agaves.images.id',
        'agaves.images.uuid',
        'agaves.images.title',
        'agaves.images.description',
        'processes',
        'flavors',
        'shops',
        'mezcalType',
        'images',
        'comments.id',
        'comments',
        'userLikes',
        'userFaves',
        'cooking',
        'milling',
        'distilling',
        'fermenting',
      ]);
    const dataQuery = getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.agaves', 'agaves')
      .leftJoinAndSelect('agaves.images', 'agaves.images')
      .leftJoinAndSelect('product.processes', 'processes')
      .leftJoinAndSelect('product.flavors', 'flavors')
      .leftJoinAndSelect('product.shops', 'shops')
      .leftJoinAndSelect('product.mezcalType', 'mezcalType')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.images', 'brand.images')
      .leftJoinAndSelect('brand.logo', 'brand.logo')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.comments', 'comments')
      .leftJoinAndSelect('product.master', 'master')
      .leftJoinAndSelect('master.images', 'master.images')
      .leftJoinAndSelect('product.region', 'region')
      .leftJoinAndSelect('product.aromas', 'aromas')
      .leftJoinAndSelect('product.cooking', 'cooking')
      .leftJoinAndSelect('product.milling', 'milling')
      .leftJoinAndSelect('product.distilling', 'distilling')
      .leftJoinAndSelect('product.fermenting', 'fermenting')
      .leftJoinAndSelect('comments.user', 'comments.user')
      .leftJoinAndSelect('product.userLikes', 'userLikes')
      .leftJoinAndSelect('userLikes.user', 'userLikes.users')
      .leftJoinAndSelect('product.userFaves', 'userFaves')
      .leftJoinAndSelect('userFaves.user', 'userFaves.users')
      .select(select)
      .where('product.id = :id', { id });

    //si viene usuario y tiene casa, solo los de su casa
    if (user && user.house) {
      const filter = {
        houseId: user.house.id,
      };
      dataQuery.andWhere('brand.houseId = :houseId', filter);
    } else {
      dataQuery.andWhere('product.active = :active', { active: true });
    }
    const product = await dataQuery.getOne();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const product2 = classToPlain(product);
    //si viene usuario y es publico, regresar el isFavorite en true en caso que sea favorito
    if (user && !user.house) {
      const isFave = await getRepository(ProductFavoritesEntity)
        .createQueryBuilder('fave')
        .leftJoin('fave.user', 'user')
        .leftJoin('fave.product', 'product')
        .where('product.id = :pId AND user.id = :uId', {
          pId: product2.id,
          uId: user.id,
        })
        .getOne();
      product2.isFavorite = !!isFave;
    }

    return product2;
  }
  /**
   * Creacion de productos
   *
   * @param productDTO
   */
  async create(
    productDTO: createProductDTO,
    user: JWTPayLoadDTO,
  ): Promise<ProductEntity> {
    //verificar que la marca de donde se quiere crear, pertenezca a la casa del usuario
    const active = true;
    const brand = await getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoin('brand.house', 'house')
      .where(
        'brand.id=:brandId AND house.id=:houseId AND brand.active=:active',
        {
          brandId: productDTO.brand,
          houseId: user.house.id,
          active: active,
        },
      )
      .getOne();

    if (!brand) {
      throw new HttpException('Esa marca no existe', HttpStatus.NOT_FOUND);
    }

    const region: RegionEntity = await getRepository(RegionEntity)
      .createQueryBuilder()
      .where('id=:id AND active=:active', {
        id: productDTO.region,
        active: active,
      })
      .getOne();

    if (!region) {
      throw new HttpException('La region no existe', 404);
    }

    const mezcalType: MezcalTypeEntity = await getRepository(MezcalTypeEntity)
      .createQueryBuilder()
      .where('id=:id AND active=:active', {
        id: productDTO.mezcalType,
        active: active,
      })
      .getOne();

    if (!mezcalType) {
      throw new HttpException('El tipo de mezcal no existe', 404);
    }

    const product = {
      nombre: productDTO.nombre,
      descripcion: productDTO.descripcion,
      html: productDTO.html,
      active: true,
      brand: brand,
      region: region,
      mezcalType: mezcalType,
      price: productDTO.price,
    };

    return await getRepository(ProductEntity).save(product);
  }
  /**
   * Actualizacion de productos en su informacion basica
   *
   * @param id del producto a actualizar
   * @param {JWTPayLoadDTO} updateData datos a cambiar
   */
  async update(
    id: number,
    updateData: UpdateProductDTO,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();

    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }
    const brand: BrandEntity = await getRepository(BrandEntity)
      .createQueryBuilder('brand')
      .leftJoin('brand.house', 'house')
      .where(
        'brand.id=:brandId AND house.id=:houseId AND brand.active=:active',
        {
          brandId: updateData.brand
            ? updateData.brand
            : (await myProduct).brandId,
          houseId: user.house.id,
          active: true,
        },
      )
      .getOne();

    if (!brand) {
      throw new HttpException('Esa marca no existe', HttpStatus.NOT_FOUND);
    }

    const region: RegionEntity = await getRepository(RegionEntity)
      .createQueryBuilder()
      .where('id=:id AND active=:active', {
        id: updateData.region ? updateData.region : (await myProduct).regionId,
        active: true,
      })
      .getOne();

    if (!region) {
      throw new HttpException('La region no existe', 404);
    }

    const mezcalType: MezcalTypeEntity = await getRepository(MezcalTypeEntity)
      .createQueryBuilder()
      .where('id=:id AND active=:active', {
        id: updateData.mezcalType
          ? updateData.mezcalType
          : (await myProduct).mezcalTypeId,
        active: true,
      })
      .getOne();

    if (!mezcalType) {
      throw new HttpException('El tipo de mezcal no existe', 404);
    }
    const updateProduct = {
      nombre: updateData.nombre ? updateData.nombre : (await myProduct).nombre,
      descripcion: updateData.descripcion ? updateData.descripcion : '',
      html: updateData.html ? updateData.html : '',
      brand: brand,
      region: region,
      mezcalType: mezcalType,
      price: updateData.price ? updateData.price : (await myProduct).price,
      score: updateData.score ? updateData.score : (await myProduct).score,
      rating: updateData.rating ? updateData.rating : (await myProduct).rating,
      colorAspect: updateData.colorAspect
        ? updateData.colorAspect
        : (await myProduct).colorAspect,
      agingMaterial: updateData.agingMaterial
        ? updateData.agingMaterial
        : (await myProduct).agingMaterial,
      agingTime: updateData.agingTime
        ? updateData.agingTime
        : (await myProduct).agingTime,
      alcoholVolume: updateData.alcoholVolume
        ? updateData.alcoholVolume
        : (await myProduct).alcoholVolume,
      distillingsNumber: updateData.distillingsNumber
        ? updateData.distillingsNumber
        : (await myProduct).distillingsNumber,
      ltProduced: updateData.ltProduced
        ? updateData.ltProduced
        : (await myProduct).ltProduced,
    };
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set(updateProduct)
      .where('id = :id', { id })
      .execute();
  }

  /**
   * Actualiza los agaves de un producto, se verifica que el producto pertenezca
   * a la casa y que los agaves existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} agaves array de ids de los agaves a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateAgaves(
    id: number,
    agavesArray: number[],
    user: JWTPayLoadDTO,
  ): Promise<void> {
    //validamos que el producto le pertenezca a la casa del usuario
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }

    //traer las relaciones actuales
    const agavesAnteriores = await getRepository(ProductEntity)
      .createQueryBuilder()
      .relation(ProductEntity, 'agaves')
      .of(myProduct)
      .loadMany();

    if (agavesArray.length) {
      //vamos por los agaves que esten activos.
      const active = true;
      const agavesNuevos = await getRepository(AgaveEntity)
        .createQueryBuilder()
        .where('id IN (:...ids) AND active = :active', {
          ids: agavesArray,
          active: active,
        })
        .getMany();
      //editar las relaciones, quitar las anteriores y poner las nuevas
      await getRepository(ProductEntity)
        .createQueryBuilder()
        .relation(ProductEntity, 'agaves')
        .of(myProduct)
        .addAndRemove(agavesNuevos, agavesAnteriores);
    } else {
      //remover las relaciones de agaves
      await getRepository(ProductEntity)
        .createQueryBuilder()
        .relation(ProductEntity, 'agaves')
        .of(myProduct)
        .remove(agavesAnteriores);
    }
  }
  /**
   * Actualiza los procesos de un producto, se verifica que el producto pertenezca
   * a la casa y que los procesos existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} procesos array de ids de los procesos a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateProcesses(
    id: number,
    procesosArray: number[],
    user: JWTPayLoadDTO,
  ): Promise<void> {
    //validamos que el producto le pertenezca a la casa del usuario
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }

    //traer las relaciones actuales
    const procesosAnteriores = await getRepository(ProductEntity)
      .createQueryBuilder()
      .relation(ProductEntity, 'processes')
      .of(myProduct)
      .loadMany();

    if (procesosArray.length) {
      //vamos por los procesos que esten activos.
      const active = true;
      const procesosNuevos = await getRepository(ProcesseEntity)
        .createQueryBuilder()
        .where('id IN (:...ids) AND active = :active', {
          ids: procesosArray,
          active: active,
        })
        .getMany();
      //editar las relaciones, quitar las anteriores y poner las nuevas
      await getRepository(ProductEntity)
        .createQueryBuilder()
        .relation(ProductEntity, 'processes')
        .of(myProduct)
        .addAndRemove(procesosNuevos, procesosAnteriores);
    } else {
      //remover las relaciones de processes
      await getRepository(ProductEntity)
        .createQueryBuilder()
        .relation(ProductEntity, 'processes')
        .of(myProduct)
        .remove(procesosAnteriores);
    }
  }

  /**
   * Actualiza los sabores de un producto, se verifica que el producto pertenezca
   * a la casa y que los sabores existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} flavors array de ids de los sabores a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateFlavors(
    id: number,
    organolepticas: string[],
    user: JWTPayLoadDTO,
  ): Promise<void> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();

    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }

    await getRepository(ProductEntity)
      .createQueryBuilder()
      .where('id = :productId', {
        productId: id,
      })
      .update()
      .set({ organolepticas: organolepticas })
      .execute();
  }
  /**
   * Actualiza las tiendas de un producto, se verifica que el producto pertenezca
   * a la casa y que las tiendas existan y esten activos.
   *
   * @param id id del producto a actualizar
   * @param {number[]} flavors array de ids de las tiendas a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateShops(
    id: number,
    shopsArray: number[],
    user: JWTPayLoadDTO,
  ): Promise<void> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }

    //traer las relaciones actuales
    const shopsAnteriores = await getRepository(ProductEntity)
      .createQueryBuilder()
      .relation(ProductEntity, 'shops')
      .of(myProduct)
      .loadMany();

    if (shopsArray.length) {
      //vamos por las shops que esten activos.
      const active = true;
      const shopsNuevos = await getRepository(ShopEntity)
        .createQueryBuilder('shop')
        .where('shop.id IN (:...ids) AND shop.active = :active', {
          ids: shopsArray,
          active: active,
        })
        .getMany();

      //editar las relaciones, quitar las anteriores y poner las nuevas
      await getRepository(ProductEntity)
        .createQueryBuilder()
        .relation(ProductEntity, 'shops')
        .of(myProduct)
        .addAndRemove(shopsNuevos, shopsAnteriores);
    } else {
      await getRepository(ProductEntity)
        .createQueryBuilder()
        .relation(ProductEntity, 'shops')
        .of(myProduct)
        .remove(shopsAnteriores);
    }
  }

  /**
   * Actualiza el maestro de un producto, se verifica que el producto pertenezca
   * a la casa y que el maestro sea de la casa del usuario que edita
   *
   * @param id id del producto a actualizar
   * @param {number} master id del maestro a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateMaster(
    id: number,
    master: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }

    //validamos que el master a asignar, sea de la casa
    const myMaster = await getRepository(MasterEntity)
      .createQueryBuilder('master')
      .leftJoin('master.house', 'house')
      .where('master.id = :masterId AND house.id = :houseId', {
        masterId: master,
        houseId: user.house.id,
      })
      .getOne();
    if (!myMaster) {
      throw new HttpException('El maestro no existe', HttpStatus.NOT_FOUND);
    }

    //hacemos el update
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        master: myMaster,
      })
      .where('id = :id', { id })
      .execute();
  }
  /**
   * Actualiza el tipo de mezcal de un producto, se verifica que el producto pertenezca
   * a la casa y que el tipo de mezcal exista
   *
   * @param id id del producto a actualizar
   * @param {number} mezcalType id del mezcalType a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateMezcalType(
    id: number,
    mezcalType: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }
    //validamos que el tipo de mezcal exista
    const active = true;
    const myMezcalType = await getRepository(MezcalTypeEntity)
      .createQueryBuilder('mezcalType')
      .where('mezcalType.id = :id AND mezcalType.active = :active', {
        id: mezcalType,
        active: active,
      })
      .getOne();
    if (!myMezcalType) {
      throw new HttpException(
        'El tipo de mezcal no existe',
        HttpStatus.NOT_FOUND,
      );
    }

    //hacemos el update
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        mezcalType: myMezcalType,
      })
      .where('id = :id', { id })
      .execute();
  }
  /**
   * Actualiza la region de un producto, se verifica que el producto pertenezca
   * a la casa y que la region exista
   *
   * @param id id del producto a actualizar
   * @param {number} region id de la region a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateRegion(
    id: number,
    region: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }
    //validamos que la region exista
    const active = true;
    const myRegion = await getRepository(RegionEntity)
      .createQueryBuilder('region')
      .where('region.id = :id AND region.active = :active', {
        id: region,
        active: active,
      })
      .getOne();
    if (!myRegion) {
      throw new HttpException('La región no existe', HttpStatus.NOT_FOUND);
    }

    //hacemos el update
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        region: myRegion,
      })
      .where('id = :id', { id })
      .execute();
  }
  /**
   * Actualiza cooking de un producto, se verifica que el producto pertenezca
   * a la casa y que cooking exista
   *
   * @param id id del producto a actualizar
   * @param {number} cooking id de cooking a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateCooking(
    id: number,
    cooking: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }
    //validamos que la cooking exista
    const myCooking = await getRepository(CookingEntity)
      .createQueryBuilder('cooking')
      .where('cooking.id = :id AND cooking.active = :active', {
        id: cooking,
        active: true,
      })
      .getOne();
    if (!myCooking) {
      throw new HttpException(
        'El tipo de cocinado no existe',
        HttpStatus.NOT_FOUND,
      );
    }

    //hacemos el update
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        cooking: myCooking,
      })
      .where('id = :id', { id })
      .execute();
  }
  /**
   * Actualiza milling de un producto, se verifica que el producto pertenezca
   * a la casa y que milling exista
   *
   * @param id id del producto a actualizar
   * @param {number} milling id de milling a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateMilling(
    id: number,
    milling: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }
    //validamos que la milling exista
    const myMilling = await getRepository(MillingEntity)
      .createQueryBuilder('milling')
      .where('milling.id = :id AND milling.active = :active', {
        id: milling,
        active: true,
      })
      .getOne();
    if (!myMilling) {
      throw new HttpException(
        'El tipo de molienda no existe',
        HttpStatus.NOT_FOUND,
      );
    }

    //hacemos el update
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        milling: myMilling,
      })
      .where('id = :id', { id })
      .execute();
  }
  /**
   * Actualiza distilling de un producto, se verifica que el producto pertenezca
   * a la casa y que distilling exista
   *
   * @param id id del producto a actualizar
   * @param {number} distilling id de distilling a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateDistilling(
    id: number,
    distilling: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }
    //validamos que la distilling exista
    const myDistilliing = await getRepository(DistillingEntity)
      .createQueryBuilder('distilling')
      .where('distilling.id = :id AND distilling.active = :active', {
        id: distilling,
        active: true,
      })
      .getOne();
    if (!myDistilliing) {
      throw new HttpException(
        'El tipo de destilación no existe',
        HttpStatus.NOT_FOUND,
      );
    }

    //hacemos el update
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        distilling: myDistilliing,
      })
      .where('id = :id', { id })
      .execute();
  }
  /**
   * Actualiza fermenting de un producto, se verifica que el producto pertenezca
   * a la casa y que fermenting exista
   *
   * @param id id del producto a actualizar
   * @param {number} fermenting id de fermenting a relacionar con el producto
   * @param {JWTPayLoadDTO} user en sesion
   */
  async updateFermenting(
    id: number,
    fermenting: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //validamos que el producto le pertenezca
    const myProduct = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('product.id = :productId AND house.id = :houseId', {
        productId: id,
        houseId: user.house.id,
      })
      .getOne();
    if (!myProduct) {
      throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
    }
    //validamos que la fermenting exista
    const myFermenting = await getRepository(FermentingEntity)
      .createQueryBuilder('fermenting')
      .where('fermenting.id = :id AND fermenting.active = :active', {
        id: fermenting,
        active: true,
      })
      .getOne();
    if (!myFermenting) {
      throw new HttpException(
        'El tipo de fermentación no existe',
        HttpStatus.NOT_FOUND,
      );
    }

    //hacemos el update
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({
        fermenting: myFermenting,
      })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del producto a borrar
   * @param {JWTPayLoadDTO} user - el usuario en sesion que intenta borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number, user: JWTPayLoadDTO): Promise<DeleteResult> {
    //buscamos el producto tomando en cuenta la casa del usuario
    const product = await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'brand.house')
      .where('product.id = :id AND brand.house.id = :houseId', {
        id,
        houseId: user.house.id,
      })
      .getOne();

    //si existe, lo borramos
    if (product) {
      return await getRepository(ProductEntity).delete(product.id);
    }

    //si no, regresamos un 404
    throw new HttpException('El producto no existe', HttpStatus.NOT_FOUND);
  }

  async authorizeComment(
    p: number,
    c: number,
    user,
    authorized = true,
  ): Promise<UpdateResult> {
    const commentRepository = getRepository(ProductCommentsEntity);
    const theComment = await commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.product', 'product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .where('comment.id = :c AND product.id = :p AND house.id = :h', {
        c,
        p,
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
   *
   * Obtener los comentarios de un producto
   * @param user usuario en sesion
   */
  async comments(user): Promise<ProductCommentsEntity[]> {
    const myProduct = getRepository(HouseEntity)
      .createQueryBuilder('house')
      .where('house.id = :houseId', {
        houseId: user.house.id,
      })
      .getOne();

    if (!myProduct) {
      throw new HttpException('La casa no existe', HttpStatus.NOT_FOUND);
    }
    return await getRepository(ProductCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.product', 'product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('brand.house', 'house')
      .select(['comment', 'product.id'])
      .where('house.id = :houseId AND comment.authorized = :authorized', {
        authorized: false,
        houseId: user.house.id,
      })
      .getMany();
  }

  /**
   * Pagionacion de productos de una marca
   *
   * @param options
   */
  async paginate(
    options: PaginationPrimeNgProducts,
    user?: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    const select = user.house
      ? [
        'product',
        'agaves',
        'master',
        'region',
        'processes',
        'flavors',
        'shops',
        'mezcalType',
        'brand',
        'brand.house',
        'images',
      ]
      : [
        'product',
        'region.id',
        'region.nombre',
        'brand.id',
        'brand.nombre',
        'brand.house.id',
        'brand.house.nombre',
        'master.id',
        'master.nombre',
        'agaves.id',
        'agaves.nombre',
        'processes.id',
        'processes.nombre',
        'flavors.id',
        'flavors.nombre',
        'shops.id',
        'shops.nombre',
        'mezcalType.id',
        'mezcalType.nombre',
        'images.id',
        'images.uuid',
        'images.title',
        'images.description',
      ];

    const dataQuery = getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.agaves', 'agaves')
      .leftJoinAndSelect('product.master', 'master')
      .leftJoinAndSelect('product.region', 'region')
      .leftJoinAndSelect('product.processes', 'processes')
      .leftJoinAndSelect('product.flavors', 'flavors')
      .leftJoinAndSelect('product.shops', 'shops')
      .leftJoinAndSelect('product.mezcalType', 'mezcalType')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.house', 'brand.house')
      .leftJoinAndSelect('product.images', 'images')
      .select(select);

    //si es un owner
    if (user && user.house) {
      dataQuery.andWhere('brand.house.id = :houseId', {
        houseId: user.house.id,
      });
    } else {
      dataQuery.andWhere('product.active = :active', {
        active: true,
      });
    }

    forIn(options.filters, (value, key) => {
      switch (key) {
        case 'search':
          dataQuery.andWhere(
            '( brand.nombre LIKE :term OR brand.house.nombre LIKE :term OR product.nombre LIKE :term)',
            { term: `%${value.split(' ').join('%')}%` },
          );
          break;
        case 'agave':
          dataQuery.andWhere('agaves.id=:value', { value });
          break;
        case 'brand':
          dataQuery.andWhere('brand.id=:value', { value });
          break;
        case 'master':
          dataQuery.andWhere('master.id=:value', { value });
          break;
        case 'house':
          dataQuery.andWhere('brand.house.id=:value', { value });
          break;
        case 'region':
          dataQuery.andWhere('region.id=:value', { value });
          break;
        case 'flavor':
          dataQuery.andWhere('flavors.id=:value', { value });
          break;
        case 'shop':
          dataQuery.andWhere('shops.id=:value', { value });
          break;
        case 'mezcalType':
          dataQuery.andWhere('mezcalType.id=:value', { value });
          break;
        case 'process':
          dataQuery.andWhere('processes.id=:value', { value });
          break;
        case 'price':
          dataQuery.andWhere('price BETWEEN :from AND :to', {
            from: value.from,
            to: value.to,
          });
          break;
        case 'rating':
          dataQuery.andWhere('product.rating BETWEEN :from AND :to', {
            from: value.from,
            to: value.to,
          });
          break;
        default:
          //SE VINO UN FILTER NO RECONOCIDO!
          break;
      }
    });

    //solo de casas activas!
    if (user && !user.house) {
      dataQuery.andWhere('brand.house.active = :active', { active: true });
    }

    switch (options.sort) {
      case SortTypes.MEJOR_CALIFICADOS:
        dataQuery.orderBy('product.rating', 'DESC');
        break;
      case SortTypes.PRECIO_MAYOR:
        dataQuery.orderBy('product.price', 'DESC');
        break;
      case SortTypes.PRECIO_MENOR:
        dataQuery.orderBy('product.price', 'ASC');
        break;
      case SortTypes.RECIENTES:
        dataQuery.orderBy('product.createdAt', 'DESC');
        break;
      default:
        //SE VINO UN FILTER NO RECONOCIDO!
        break;
    }

    const count = await dataQuery.getCount();

    const data = await dataQuery
      .skip(options.skip)
      .take(options.take)
      .getMany();

    //lo pasamos a plain object para poder agregarle el isFave a cada producto, el cual no pertenece a la entidad
    const data2 = data.map((p) => classToPlain(p));
    //si viene un user y es publico, agregar un true a cada producto que sea su favorito
    if (user && !user.house && data2.length) {
      const prodIds = data2.map((p) => p.id);

      const favoritos = await getRepository(ProductFavoritesEntity)
        .createQueryBuilder('fave')
        .leftJoinAndSelect('fave.product', 'product')
        .leftJoinAndSelect('fave.user', 'user')
        .where('user.id = :userId AND product.id IN (:...prodIds)', {
          userId: user.id,
          prodIds,
        })
        .getMany();

      const likes = await getRepository(ProductLikesEntity)
        .createQueryBuilder('liked')
        .leftJoinAndSelect('liked.product', 'product')
        .leftJoinAndSelect('liked.user', 'user')
        .where('user.id = :userId AND product.id IN (:...prodIds)', {
          userId: user.id,
          prodIds,
        })
        .getMany();

      if (favoritos) {
        favoritos.forEach((favorito) => {
          const idx = data2.findIndex((p) => {
            return p.id === favorito.product.id;
          });
          if (idx > -1) {
            data2[idx].isFavorite = true;
          }
        });
      }

      if (likes) {
        likes.forEach((like) => {
          const idx = data2.findIndex((p) => {
            return p.id === like.product.id;
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
   * Almacena un rating de un producto
   *
   * @param userId id del usario que hace el rating
   * @param productId id del producto que se le hace rating
   * @param rating score
   */
  async rate(
    user: UserEntity,
    productId: number,
    rating: number,
  ): Promise<RateDTO> {
    //obtener la entidad del producto
    const product = await getRepository(ProductEntity).findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const rateExiste = await getRepository(ProductRatingEntity).findOne({
      where: {
        product: product,
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

    let createdRating;
    const newRating = new ProductRatingEntity(user, product, rating);
    try {
      //crear el rating
      createdRating = await getRepository(ProductRatingEntity).save(newRating);
    } catch (error) {
      throw error;
    }

    //buscar todos los ratings de este producto y promediarlos
    const productRating = await getRepository(ProductRatingEntity)
      .createQueryBuilder()
      .select('AVG(rating)', 'rating')
      .where({ product: product.id })
      .getRawOne();

    //actualizar rating en el producto
    const result = await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({ rating: productRating.rating })
      .where('id=:id', { id: product.id })
      .execute();

    const response: RateDTO = {
      rating: createdRating.rating,
      newRating: productRating.rating,
      affected: result.affected,
    };

    return response;
  }

  /**
   * Verifica si el usuario en sesion ha hecho rating a un producto
   *
   * @param user usuario en sesion
   * @param id id del producto
   * @returns true / false dependiendo si ha hecho o no rating del producto el usuario
   */
  async getUserRate(id: number, user: UserEntity): Promise<RatingResponseDTO> {
    const rated = await getRepository(ProductRatingEntity)
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .leftJoinAndSelect('rating.product', 'product')
      .where('user.id=:userId AND product.id =:productId', {
        userId: user.id,
        productId: id,
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
   * Actualiza el rating de un usuario en un producto
   *
   * @param id id del producto
   * @param user Usuario en sesion
   * @param rating nuevo rating
   * @returns resultados de la actualizacion
   */
  async updateUserRating(
    id: number,
    user: UserEntity,
    rating: number,
  ): Promise<UpdateResult> {
    await getRepository(ProductRatingEntity)
      .createQueryBuilder('rating')
      .leftJoin('rating.user', 'user')
      .leftJoin('rating.product', 'product')
      .update()
      .set({ rating })
      .where('user.id=:userId AND product.id =:productId', {
        userId: user.id,
        productId: id,
      })
      .execute();

    const productRating = await getRepository(ProductRatingEntity)
      .createQueryBuilder()
      .select('AVG(rating)', 'rating')
      .where({ product: id })
      .getRawOne();

    //actualizar rating en el producto
    return await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({ rating: productRating.rating })
      .where('id=:id', { id })
      .execute();
  }

  /**
   * Guardar un nuevo comentario de un producto
   *
   * @param user usuario que comenta
   * @param productId id del producto que recibe el comentario
   * @param comment comentario de texto
   */
  async comment(
    user: UserEntity,
    productId: number,
    comment: string,
  ): Promise<ProductCommentsEntity> {
    //obtener la entidad del producto
    const product = await getRepository(ProductEntity).findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    //crear el rating
    const newComment = new ProductCommentsEntity(user, product, comment, true);
    return await getRepository(ProductCommentsEntity).save(newComment);
  }

  /**
   * Guardar una nueva degustacion de un producto
   *
   * @param user usuario que degusta
   * @param productId id del producto que recibe la degustacion
   * @param experience texto de la experiencia del usuario
   */
  async taste(
    user: UserEntity,
    productId: number,
    experience: string,
  ): Promise<ProductTastingsEntity> {
    //obtener la entidad del producto
    const product = await getRepository(ProductEntity).findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    //crear el rating
    const newTasting = new ProductTastingsEntity(user, product, experience);
    return await getRepository(ProductTastingsEntity).save(newTasting);
  }

  /**
   * elimina una degustacion
   *
   * @param id id de la degustacion
   * @param user usuario en sesion
   * @returns {DeleteResult} resultados de la eliminacion
   */
  async deleteTaste(id: number, user: UserEntity): Promise<DeleteResult> {
    const taste = await getRepository(ProductTastingsEntity)
      .createQueryBuilder('tasting')
      .leftJoin('tasting.user', 'user')
      .where('tasting.id =:id', { id })
      .andWhere('user.id=:userId', { userId: user.id })
      .getOne();
    if (!taste) {
      throw new HttpException('La degustación no existe', HttpStatus.NOT_FOUND);
    }
    return await getRepository(ProductTastingsEntity).delete(id);
  }

  /**
   * Obtiene los productos a los cuales ha dado like un usuario
   * @param user usuario en sesion
   */
  async getProductsLikedByUser(user: UserEntity): Promise<ProductEntity[]> {
    if (!user) {
      throw new HttpException('requiere un usuario', HttpStatus.BAD_REQUEST);
    }

    return await getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoin('product.userLikes', 'productLikes')
      .leftJoinAndSelect('product.agaves', 'agaves')
      .leftJoinAndSelect('product.master', 'master')
      .leftJoinAndSelect('product.region', 'region')
      .leftJoinAndSelect('product.processes', 'processes')
      .leftJoinAndSelect('product.flavors', 'flavors')
      .leftJoinAndSelect('product.shops', 'shops')
      .leftJoinAndSelect('product.mezcalType', 'mezcalType')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.house', 'brand.house')
      .leftJoinAndSelect('product.images', 'images')
      .select([
        'product',
        'region.id',
        'region.nombre',
        'brand.id',
        'brand.nombre',
        'brand.house.id',
        'brand.house.nombre',
        'master.id',
        'master.nombre',
        'agaves.id',
        'agaves.nombre',
        'processes.id',
        'processes.nombre',
        'flavors.id',
        'flavors.nombre',
        'shops.id',
        'shops.nombre',
        'mezcalType.id',
        'mezcalType.nombre',
        'images.id',
        'images.uuid',
        'images.title',
        'images.description',
      ])
      .where('productLikes.user=:userId', { userId: user.id })
      .getMany();
  }

  /**
   * Me gusta!
   *
   * @param user usuario al que le gusta
   * @param productId que producto
   */
  async like(user: UserEntity, productId: number): Promise<boolean> {
    const product = await getRepository(ProductEntity).findOne(productId);

    if (!product || !product.id) {
      throw new HttpException('No existe el producto.', HttpStatus.NOT_FOUND);
    }
    //si el like ya existe, solo lo regresamos
    const likeExistente = await getRepository(ProductLikesEntity).findOne({
      where: {
        user: user.id,
        product: productId,
      },
    });

    if (likeExistente && likeExistente.id) {
      return false;
    }

    await getRepository(ProductLikesEntity).save(
      new ProductLikesEntity(user, product),
    );

    //actualizar los likes del producto
    const likesResult = await getRepository(ProductLikesEntity)
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .where({ product: product.id })
      .getRawOne();

    //TODO: trycatch
    await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({ likes: likesResult.total })
      .where('id=:id', { id: product.id })
      .execute();
    return true;
  }

  async dislike(user: UserEntity, productId: number): Promise<boolean> {
    const product = await getRepository(ProductEntity).findOne(productId);

    if (!product || !product.id) {
      throw new HttpException('No existe el producto.', HttpStatus.NOT_FOUND);
    }
    //si el like ya existe, solo lo regresamos
    const likeExistente = await getRepository(ProductLikesEntity).findOne({
      where: {
        user: user.id,
        product: productId,
      },
    });

    if (!likeExistente) {
      return false;
    }

    const result = await getRepository(ProductLikesEntity)
      .createQueryBuilder('like')
      .leftJoin('like.user', 'user')
      .leftJoin('like.product', 'product')
      .where('user.id = :userId AND product.id = :productId', {
        userId: user.id,
        productId,
      })
      .delete()
      .execute();

    if (result.affected) {
      //actualizar los likes del producto
      const likesResult = await getRepository(ProductLikesEntity)
        .createQueryBuilder()
        .select('COUNT(*)', 'total')
        .where({ product: product.id })
        .getRawOne();

      //TODO: trycatch
      await getRepository(ProductEntity)
        .createQueryBuilder()
        .update()
        .set({ likes: likesResult.total })
        .where('id=:id', { id: product.id })
        .execute();
      return true;
    }
    return false;
  }

  /**
   * Agregar a favoritos!
   *
   * @param user usuario que lo agrega
   * @param productId que producto
   */
  async addToFavorites(
    user: JWTPayLoadDTO,
    productId: number,
  ): Promise<boolean> {
    const product = await getRepository(ProductEntity).findOne(productId);
    const userCompleto = await getRepository(UserEntity).findOne(user.sub);
    if (!product || !product.id) {
      throw new HttpException('No existe el producto.', HttpStatus.NOT_FOUND);
    }
    //si ya lo tiene en favoritos...
    const faveExistente = await getRepository(ProductFavoritesEntity).findOne({
      where: {
        user: user.sub,
        product: productId,
      },
    });

    if (faveExistente && faveExistente.id) {
      return false;
    }

    await getRepository(ProductFavoritesEntity).save(
      new ProductFavoritesEntity(userCompleto, product),
    );

    //actualizar los likes del producto
    const favoritesResult = await getRepository(ProductFavoritesEntity)
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .where({ product: product.id })
      .getRawOne();

    //TODO: trycatch
    await getRepository(ProductEntity)
      .createQueryBuilder()
      .update()
      .set({ score: favoritesResult.total })
      .where('id=:id', { id: product.id })
      .execute();
    return true;
  }

  /**
   * Quitar de favoritos!
   *
   * @param user usuario que lo quita
   * @param productId que producto
   */
  async removeFromFavorites(
    user: JWTPayLoadDTO,
    productId: number,
  ): Promise<boolean> {
    const product = await getRepository(ProductEntity).findOne(productId);

    if (!product || !product.id) {
      throw new HttpException('No existe el producto.', HttpStatus.NOT_FOUND);
    }
    //si ya lo tiene en favoritos...
    const faveExistente = await getRepository(ProductFavoritesEntity).findOne({
      where: {
        user: user.sub,
        product: productId,
      },
    });

    if (!faveExistente) {
      return false;
    }

    const result = await getRepository(ProductFavoritesEntity)
      .createQueryBuilder('fave')
      .leftJoin('fave.user', 'user')
      .leftJoin('fave.product', 'product')
      .where('user.id = :userId AND product.id = :productId', {
        userId: user.sub,
        productId,
      })
      .delete()
      .execute();
    return result.affected === 1;
  }

  /**
   * Obtener los favoritos de un usuario
   *
   * @param user usuario que solicita sus favoritos
   */
  async getFavorites(user: UserEntity): Promise<ProductFavoritesEntity[]> {
    return await getRepository(ProductFavoritesEntity).find({
      where: { user: user.id },
      relations: [
        'product',
        'product.brand',
        'product.flavors',
        'product.region',
      ],
    });
  }

  /**
   * Obtener los comentarios de un producto
   *
   * @param id id del producto
   */
  async getCommentsByProduct(
    productId: number,
  ): Promise<ProductCommentsEntity[]> {
    return await getRepository(ProductCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('productId=:id AND comment.authorized=:aut', { id: productId, aut: true })
      .select([
        'comment.id',
        'comment.comment',
        'comment.authorized',
        'comment.createdAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.picUrl',
      ])
      .getMany();
  }

  /**
   * Obtiene los comentarios hechos en los productos por un usuario
   *
   * @param user usuario en sesión
   * @returns {ProductCommentsEntity[]} Arreglo de comentarios de un producto con el producto
   */
  async getCommentsByUser(user: UserEntity): Promise<ProductCommentsEntity[]> {
    return await getRepository(ProductCommentsEntity)
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoinAndSelect('comment.product', 'product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.logo', 'logo')
      .select([
        'comment',
        'product.id',
        'product.nombre',
        'product.descripcion',
        'product.rating',
        'product.price',
        'product.createdAt',
        'product.likes',
        'brand.id',
        'brand.nombre',
        'brand.descripcion',
        'brand.createdAt',
        'brand.rating',
        'brand.likes',
        'logo',
      ])
      .where('user.id=:userId', { userId: user.id })
      .getMany();
  }

  /**
   * obtener la degustacion por id del producto
   * @param id id del producto
   */
  async getTastingByProductId(id: number) {
    return await getRepository(ProductTastingsEntity)
      .createQueryBuilder('tasting')
      .leftJoin('tasting.product', 'product')
      .leftJoinAndSelect('tasting.user', 'user')
      .leftJoinAndSelect('tasting.images', 'images')
      .select([
        'tasting.id',
        'tasting.experience',
        'tasting.createdAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.picUrl',
        'images',
      ])
      .orderBy('tasting.createdAt', 'DESC')
      .where('product.id=:productId', { productId: id })
      .getMany();
  }

  /**
   * obtiene degustaciones por usuario
   *
   * @param user usuario en sesion
   * @returns {ProductTastingsEntity[]} lista de degustaciones
   */
  async getTastingsByUser(user: UserEntity): Promise<any> {
    const productsTastings = await getRepository(ProductTastingsEntity)
      .createQueryBuilder('tastings')
      .leftJoin('tastings.user', 'user')
      .leftJoinAndSelect('tastings.images', 'images')
      .leftJoinAndSelect('tastings.product', 'product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.logo', 'logo')
      .select([
        'tastings',
        'images',
        'product.id',
        'product.nombre',
        'product.descripcion',
        'product.rating',
        'product.price',
        'product.score',
        'product.likes',
        'product.createdAt',
        'brand.id',
        'brand.uuid',
        'brand.nombre',
        'brand.descripcion',
        'brand.active',
        'brand.rating',
        'brand.likes',
        'logo',
      ])
      .where('user.id=:userId', { userId: user.id })
      .getMany();

    const tastings = classToPlain(productsTastings);

    for (let index = 0; index < tastings.length; index++) {
      const rated = await this.getUserRate(tastings[index].product.id, user);
      tastings[index].productRated = rated;
    }
    return tastings;
  }

  /**
   * Pagionacion de productos con marca
   *
   * @param options
   */
  async adminPaginate(
    options: PaginationPrimeNgProducts,
  ): Promise<PaginationPrimeNgResult> {
    const dataQuery = getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.images', 'images')
      .select([
        'product.id',
        'product.nombre',
        'product.descripcion',
        'product.active',
        'product.html',
        'product.rating',
        'product.price',
        'product.score',
        'product.likes',
        'product.colorAspect',
        'product.agingMaterial',
        'product.agingTime',
        'product.alcoholVolume',
        'product.distillingsNumber',
        'product.ltProduced',
        'images',
        'brand.id',
        'brand.nombre',
        'brand.descripcion',
        'brand.active',
        'brand.html',
        'brand.rating',
        'brand.likes',
      ])
      .where('product.active = :active', {
        active: true,
      });

    forIn(options.filters, (value, key) => {
      if (key === 'search') {
        dataQuery.andWhere(
          '( brand.nombre LIKE :term OR product.nombre LIKE :term)',
          { term: `%${value.split(' ').join('%')}%` },
        );
      }
    });

    switch (options.sort) {
      case SortTypes.MEJOR_CALIFICADOS:
        dataQuery.orderBy('product.rating', 'DESC');
        break;
      case SortTypes.PRECIO_MAYOR:
        dataQuery.orderBy('product.price', 'DESC');
        break;
      case SortTypes.PRECIO_MENOR:
        dataQuery.orderBy('product.price', 'ASC');
        break;
      case SortTypes.RECIENTES:
        dataQuery.orderBy('product.createdAt', 'DESC');
        break;
      default:
        //SE VINO UN FILTER NO RECONOCIDO!
        break;
    }

    const count = await dataQuery.getCount();

    const data = await dataQuery
      .skip(options.skip)
      .take(options.take)
      .getMany();

    return {
      data,
      skip: options.skip,
      totalItems: count,
    };
  }
}
