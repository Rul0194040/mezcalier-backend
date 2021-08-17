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
import { FermentingDTO } from './fermenting.dto';
import { FermentingEntity } from './fermenting.entity';
import { UserEntity } from '../../users/model/user.entity';

@Injectable()
export class FermentingService {
  async get(user?: UserEntity): Promise<FermentingEntity[]> {
    if (user) return await getRepository(FermentingEntity).find({});
    return await getRepository(FermentingEntity).find({ active: true });
  }

  async getFermentingById(id: number): Promise<FermentingEntity> {
    return await getRepository(FermentingEntity).findOne({
      id: id,
      active: true,
    });
  }
  /**
   * Cambiar el estado de un fermenting
   * @param {number} id el id del fermenting a cambiar su estado
   * @param {boolean} status El estado a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return getRepository(FermentingEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('id=:id', { id: id })
      .execute();
  }

  /**
   * Creacion de fermenting
   *
   * @param FermentingDTO objeto del fermenting a crear
   */
  async create(FermentingDTO: FermentingDTO): Promise<FermentingEntity> {
    const fermentingToCreate = {
      nombre: FermentingDTO.nombre,
      descripcion: FermentingDTO.descripcion,
      active: true,
    };

    return await getRepository(FermentingEntity).save(fermentingToCreate);
  }
  /**
   *
   * @param id id del fermenting a actualizar
   * @param FermentingDTO objeto del fermenting a crear
   */
  async update(
    id: number,
    FermentingDTO: FermentingDTO,
  ): Promise<UpdateResult> {
    const fermenting = await getRepository(FermentingEntity).findOne(id, {});
    fermenting.nombre = FermentingDTO.nombre;
    fermenting.descripcion = FermentingDTO.descripcion;
    return await getRepository(FermentingEntity).update(id, fermenting);
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del fermenting a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(FermentingEntity).delete(id);
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

    const data = await getRepository(FermentingEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(FermentingEntity).count({
        where: [filters],
      }),
    };
  }
}
