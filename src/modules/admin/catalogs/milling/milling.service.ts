import { Injectable } from '@nestjs/common';
import { forIn } from 'lodash';
import {
  Like,
  Equal,
  UpdateResult,
  DeleteResult,
  getRepository,
} from 'typeorm';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { MillingEntity } from './milling.entity';
import { MillingDTO } from './milling.dto';
import { UserEntity } from '../../users/model/user.entity';

@Injectable()
export class MillingService {
  async get(user?: UserEntity): Promise<MillingEntity[]> {
    if (user) return await getRepository(MillingEntity).find({});
    return await getRepository(MillingEntity).find({ active: true });
  }

  async getMillingById(id: number): Promise<MillingEntity> {
    return await getRepository(MillingEntity).findOne({ id: id, active: true });
  }
  /**
   * Cambiar el estado de un milling
   * @param {number} id el id del milling a cambiar su estado
   * @param {boolean} status El estado a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return getRepository(MillingEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('id=:id', { id: id })
      .execute();
  }

  /**
   * Creacion de milling
   *
   * @param MillingDTO objeto del milling a crear
   */
  async create(MillingDTO: MillingDTO): Promise<MillingEntity> {
    const millingToCreate = {
      nombre: MillingDTO.nombre,
      descripcion: MillingDTO.descripcion,
      active: true,
    };

    return await getRepository(MillingEntity).save(millingToCreate);
  }
  /**
   *
   * @param id id del milling a actualizar
   * @param MillingDTO objeto del milling a crear
   */
  async update(id: number, MillingDTO: MillingDTO): Promise<UpdateResult> {
    const milling = await getRepository(MillingEntity).findOne(id, {});
    milling.nombre = MillingDTO.nombre;
    milling.descripcion = MillingDTO.descripcion;
    return await getRepository(MillingEntity).update(id, milling);
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del milling a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(MillingEntity).delete(id);
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

    const data = await getRepository(MillingEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(MillingEntity).count({
        where: [filters],
      }),
    };
  }
}
