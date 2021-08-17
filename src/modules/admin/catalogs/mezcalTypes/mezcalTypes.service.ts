import { Injectable } from '@nestjs/common';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { MezcalTypeDTO } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.dto';
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
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
/**
 * Service para usuarios
 */
@Injectable()
export class MezcalTypesService {
  /**
   * Listado de tipos de mezcal
   */
  async get(): Promise<MezcalTypeEntity[]> {
    return await getRepository(MezcalTypeEntity).find({});
  }
  /**
   * Obtener tipo de mezcal por id
   *
   * @param id id del tipo de mezcal
   */
  async getById(id: number): Promise<MezcalTypeEntity> {
    const product = await getRepository(MezcalTypeEntity).findOne(id, {
      where: { active: true },
    });
    if (!product) {
      throw new HttpException(
        'El producto no se encuentra',
        HttpStatus.NOT_FOUND,
      );
    }
    return product;
  }
  /**
   * Creacion del tipo de mezcal
   *
   * @param mezcalTypeDTO objeto del tipo de mezcal a crear
   */
  async create(mezcalTypeDTO: MezcalTypeDTO): Promise<MezcalTypeEntity> {
    const mezcalTypeToCreate = new MezcalTypeEntity(
      undefined,
      undefined,
      mezcalTypeDTO.nombre,
      mezcalTypeDTO.descripcion,
      true,
    );

    return await getRepository(MezcalTypeEntity).save(mezcalTypeToCreate);
  }
  /**
   * Actualizacion de tipo de mezcal
   *
   * @param id id del tipo del mezcal a actualizar
   * @param mezcalTypeDTO objeto de actualizacion
   */
  async update(
    id: number,
    mezcalTypeDTO: MezcalTypeDTO,
  ): Promise<UpdateResult> {
    const mezcalType = await getRepository(MezcalTypeEntity).findOne(id, {});
    mezcalType.nombre = mezcalTypeDTO.nombre;
    mezcalType.descripcion = mezcalTypeDTO.descripcion;
    mezcalType.active = mezcalTypeDTO.active;
    return await getRepository(MezcalTypeEntity).update(id, mezcalType);
  }

  /**
   * Cambia el estado de una region
   *
   * @param id de la region a cambiar
   * @param {boolean} active estatus a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return await getRepository(MezcalTypeEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('id=:id', { id })
      .execute();
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del mezcalTypeo a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(MezcalTypeEntity).delete(id);
  }
  /**
   * Paginacion de tipos de mezcal
   * @param options Objeto de paginacion
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

    const data = await getRepository(MezcalTypeEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(MezcalTypeEntity).count({
        where: [filters],
      }),
    };
  }
}
