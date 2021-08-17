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
import { DistillingEntity } from './distilling.entity';
import { DistillingDTO } from './distilling.dto';
import { UserEntity } from '../../users/model/user.entity';

@Injectable()
export class DistillingService {
  async get(user?: UserEntity): Promise<DistillingEntity[]> {
    if (user) return await getRepository(DistillingEntity).find({});
    return await getRepository(DistillingEntity).find({ active: true });
  }

  async getDistillingById(id: number): Promise<DistillingEntity> {
    return await getRepository(DistillingEntity).findOne({
      id: id,
      active: true,
    });
  }

  /**
   * Cambiar el estado de un distilling
   * @param {number} id el id del distilling a cambiar su estado
   * @param {boolean} status El estado a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return getRepository(DistillingEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('id=:id', { id: id })
      .execute();
  }

  /**
   * Creacion de distilling
   *
   * @param DistillingDTO objeto del distilling a crear
   */
  async create(DistillingDTO: DistillingDTO): Promise<DistillingEntity> {
    const distillingToCreate = {
      nombre: DistillingDTO.nombre,
      descripcion: DistillingDTO.descripcion,
      active: true,
    };

    return await getRepository(DistillingEntity).save(distillingToCreate);
  }
  /**
   *
   * @param id id del distilling a actualizar
   * @param DistillingDTO objeto del distilling a crear
   */
  async update(
    id: number,
    DistillingDTO: DistillingDTO,
  ): Promise<UpdateResult> {
    const distilling = await getRepository(DistillingEntity).findOne(id, {});
    distilling.nombre = DistillingDTO.nombre;
    distilling.descripcion = DistillingDTO.descripcion;
    return await getRepository(DistillingEntity).update(id, distilling);
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del distilling a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(DistillingEntity).delete(id);
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

    const data = await getRepository(DistillingEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(DistillingEntity).count({
        where: [filters],
      }),
    };
  }
}
