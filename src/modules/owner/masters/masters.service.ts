import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { merge, forIn } from 'lodash';
import {
  Like,
  Equal,
  UpdateResult,
  DeleteResult,
  getRepository,
} from 'typeorm';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { MasterDTO } from './model/master.dto';
import { MasterEntity } from './model/master.entity';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
/**
 * Service para usuarios
 */
@Injectable()
export class MastersService {
  /**
   * @ignore
   */
  /**
   * Listado de maestros
   */
  async get(): Promise<MasterEntity[]> {
    return await getRepository(MasterEntity).find({});
  }
  /**
   * Obtener maestro por su id
   *
   * @param id id del maestro
   */
  async getById(id: number, completo = true): Promise<MasterEntity> {
    if (completo) {
      const data = await getRepository(MasterEntity)
        .createQueryBuilder('master')
        .where('master.id = :id', { id: id })
        .select([
          'master',
          'house.id',
          'house.uuid',
          'house.email',
          'house.nombre',
          'house.descripcion',
          'house.calle',
          'house.numExt',
          'house.numInt',
          'house.colonia',
          'house.municipio',
          'house.localidad',
          'house.estado',
          'products.id',
          'products.uuid',
          'products.nombre',
          'products.descripcion',
          'products.price',
          'images.id',
          'images.uuid',
          'images.title',
          'images.description',
          'images.destination',
        ])
        .leftJoin('master.house', 'house')
        .leftJoin('master.products', 'products')
        .leftJoin('master.images', 'images')
        .getOne();
      return data;
    }

    return await getRepository(MasterEntity).findOne(id);
  }
  /**
   * Creacion de maestro mezcalero
   *
   * @param masterDTO objeto del maestro a crear
   * @param user usuario para obtener la casa del maestro
   */
  async create(masterDTO: MasterDTO, user: UserEntity): Promise<MasterEntity> {
    const house: HouseEntity = await getRepository(HouseEntity).findOne(
      user.house.id, //obtenemos la casa del usuario recibido.
    );
    const masterToCreate = new MasterEntity(
      undefined,
      undefined,
      masterDTO.nombre,
      masterDTO.descripcion,
      masterDTO.html,
      true,
      house,
    );

    return await getRepository(MasterEntity).save(masterToCreate);
  }
  /**
   * Actualizacion de maestro
   *
   * @param id id del maestro a actualizar
   * @param masterDTO Objeto de actualizacion de maestro
   */
  async update(id: number, masterDTO: MasterDTO): Promise<UpdateResult> {
    let master = await getRepository(MasterEntity).findOne(id);
    master = merge(master, masterDTO);
    delete master.house; // como no se va a actualizar house, se pasa undefined al update
    return getRepository(MasterEntity).update(id, master);
  }

  /**
   *
   * @param id id del maestro mezcalero
   * @param active estado de activación
   * @param user usuario en sesion
   */
  async updateStatus(
    id: number,
    active: boolean,
    user?: UserEntity,
  ): Promise<UpdateResult> {
    const query = getRepository(MasterEntity)
      .createQueryBuilder('master')
      .leftJoin('master.house', 'house')
      .where('master.id = :id', { id });

    if (user && user.house) {
      query.andWhere('house.id=:houseId', { houseId: user.house.id });
    }

    const master = await query.getOne();

    if (!master) {
      throw new HttpException('El maestro no existe', HttpStatus.NOT_FOUND);
    }

    return await getRepository(MasterEntity)
      .createQueryBuilder()
      .update()
      .set({ active: active })
      .where('id=:id', { id: master.id })
      .execute();
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del mastero a borrar
   * @param {UserEntity} - el user para filtrar por su casa
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number, user: UserEntity): Promise<DeleteResult> {
    return await getRepository(MasterEntity)
      .createQueryBuilder('master')
      .leftJoin('house', 'house')
      .delete()
      .where('id=:theId', { theId: id })
      .andWhere('house.id=:houseId', { houseId: user.house.id }) //solo si es de la casa del usuario
      .execute();
  }
  /**
   * Paginacion de maestros
   * @param options opciones de paginacion
   */
  async paginate(
    options: PaginationPrimeNG,
    user: UserEntity,
  ): Promise<PaginationPrimeNgResult> {
    const filters = { house: user.house.id };
    forIn(options.filters, (value, key) => {
      if (value.matchMode === 'Like') {
        filters[key] = Like(`%${value.value}%`);
      }
      if (value.matchMode === 'Equal') {
        filters[key] = Equal(`${value.value}`);
      }
    });

    const data = await getRepository(MasterEntity).find({
      where: [filters],
      relations: ['images'],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(MasterEntity).count({ where: [filters] }),
    };
  }
}
