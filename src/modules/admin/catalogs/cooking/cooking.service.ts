import { Injectable } from '@nestjs/common';
import { forIn } from 'lodash';
import {
  getRepository,
  UpdateResult,
  Like,
  Equal,
  DeleteResult,
} from 'typeorm';
import { CookingEntity } from './cooking.entity';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { CookingDTO } from './cooking.dto';
import { UserEntity } from '../../users/model/user.entity';

@Injectable()
export class CookingService {
  async get(user?: UserEntity): Promise<CookingEntity[]> {
    if (user) return await getRepository(CookingEntity).find({});
    return await getRepository(CookingEntity).find({ active: true });
  }

  async getCookingById(id: number): Promise<CookingEntity> {
    return await getRepository(CookingEntity).findOne({ id: id, active: true });
  }

  /**
   * Cambiar el estado de un cooking
   * @param {number} id el id del cooking a cambiar su estado
   * @param {boolean} status El estado a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return getRepository(CookingEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('id=:id', { id: id })
      .execute();
  }

  /**
   * Creacion de cooking
   *
   * @param CookingDTO objeto del cooking a crear
   */
  async create(CookingDTO: CookingDTO): Promise<CookingEntity> {
    const cookingToCreate = {
      nombre: CookingDTO.nombre,
      descripcion: CookingDTO.descripcion,
      active: true,
    };

    return await getRepository(CookingEntity).save(cookingToCreate);
  }
  /**
   *
   * @param id id del cooking a actualizar
   * @param CookingDTO objeto del cooking a crear
   */
  async update(id: number, CookingDTO: CookingDTO): Promise<UpdateResult> {
    const cooking = await getRepository(CookingEntity).findOne(id, {});
    cooking.nombre = CookingDTO.nombre;
    cooking.descripcion = CookingDTO.descripcion;
    return await getRepository(CookingEntity).update(id, cooking);
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del cooking a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(CookingEntity).delete(id);
  }

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

    const data = await getRepository(CookingEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(CookingEntity).count({
        where: [filters],
      }),
    };
  }
}
