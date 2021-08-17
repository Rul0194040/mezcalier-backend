import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { ShopDTO } from '@mezcal/modules/owner/shops/model/shop.dto';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { forIn } from 'lodash';
import {
  Like,
  Equal,
  UpdateResult,
  DeleteResult,
  getRepository,
} from 'typeorm';
import { HouseEntity } from '../../house.entity';
/**
 * Service para usuarios
 */
@Injectable()
export class ShopsService {
  /**
   * @ignore
   */
  /* constructor(
    @InjectRepository(ShopEntity)
    private shopsRepository: Repository<ShopEntity>,
  ) {} */
  /**
   * Listado de tiendas
   */
  async getHouseId(id): Promise<ShopEntity[]> {
    const house = await getRepository(HouseEntity).findOne(id);
    const shops = await getRepository(ShopEntity).find({
      where: { house: house },
    });
    return shops;
  }

  async get(): Promise<ShopEntity[]> {
    return await getRepository(ShopEntity).find({});
  }

  /**
   * Obtener tienda por id
   *
   * @param id
   */
  async getById(id: number): Promise<ShopEntity> {
    const query = getRepository(ShopEntity)
      .createQueryBuilder('shop')
      .where('shop.id = :shopId', { shopId: id });

    const shop = await query.getOne();

    if (!shop) {
      throw new HttpException(
        'La tienda no se encuentra',
        HttpStatus.NOT_FOUND,
      );
    }

    return shop;
  }

  /**
   * Creaciopn de tiendas
   *
   * @param shopDTO
   */
  async create(shopDTO: ShopDTO): Promise<ShopEntity> {
    const shopToCreate = new ShopEntity(
      undefined,
      undefined,
      shopDTO.nombre,
      shopDTO.descripcion,
      false,
      shopDTO.formattedAddress,
      shopDTO.addressComponents,
      shopDTO.url,
      shopDTO.placeId,
    );

    return await getRepository(ShopEntity).save(shopToCreate);
  }

  /**
   * Actualizacion de tiendas
   *
   * @param id
   * @param brandDTO
   */
  async update(id: number, shopDTO: ShopDTO): Promise<UpdateResult> {
    const query = getRepository(ShopEntity)
      .createQueryBuilder('shop')
      .where('shop.id = :id', { id });

    const theShop = await query.getOne();
    if (!theShop) {
      throw new HttpException(
        'La tienda no se encuentra',
        HttpStatus.NOT_FOUND,
      );
    }
    return await getRepository(ShopEntity)
      .createQueryBuilder()
      .update()
      .set({
        nombre: shopDTO.nombre,
        descripcion: shopDTO.descripcion,
        addressComponents: shopDTO.addressComponents,
        formattedAddress: shopDTO.formattedAddress,
        placeId: shopDTO.placeId,
        url: shopDTO.url,
        active: shopDTO.active,
      })
      .where('id=:id', { id: theShop.id })
      .execute();
  }

  /**
   * Actualiza el estado de una shop
   * @param id id de la shop
   * @param active estado de la shop true / false
   * @param user usuario en sesion
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    const query = getRepository(ShopEntity)
      .createQueryBuilder('shop')
      .where('shop.id = :id', { id });

    const shop = await query.getOne();
    if (!shop) {
      throw new HttpException(
        'La tienda no se encuentra',
        HttpStatus.NOT_FOUND,
      );
    }

    return await getRepository(ShopEntity)
      .createQueryBuilder()
      .update()
      .set({ active: active })
      .where('id=:id', { id: shop.id })
      .execute();
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del shopo a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(ShopEntity).delete(id);
  }
  /**
   * Paginacion de la tienda
   * @param options
   */
  async paginate(options: PaginationPrimeNG): Promise<PaginationPrimeNgResult> {
    const filters = {};
    forIn(options.filters, (value, key) => {
      if (value.matchMode === 'Like') {
        filters[key] = Like(`%${value.value}%`);
      }
      if (value.matchMode === 'Equal') {
        filters[key] = Equal(`${value.value}`);
      }
    });

    const data = await getRepository(ShopEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(ShopEntity).count({ where: [filters] }),
    };
  }
}
