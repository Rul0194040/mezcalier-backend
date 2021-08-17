import { Injectable } from '@nestjs/common';
import { FlavorEntity } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.entity';
import { FlavorDTO } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.dto';
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
export class FlavorsService {
  /**
   * Listar sabores
   */
  async get(): Promise<FlavorEntity[]> {
    return await getRepository(FlavorEntity).find({});
  }
  /**
   * Ver sabor por id
   *
   * @param id id del sabor
   */
  async getById(id: number): Promise<FlavorEntity> {
    const product = await getRepository(FlavorEntity).findOne(id, {
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
   * Creacion de un sabor
   *
   * @param flavorDTO objeto del sabor a crear
   */
  async create(flavorDTO: FlavorDTO): Promise<FlavorEntity> {
    const flavorToCreate = new FlavorEntity(
      undefined,
      undefined,
      flavorDTO.nombre,
      flavorDTO.html,
      true,
    );

    return await getRepository(FlavorEntity).save(flavorToCreate);
  }
  /**
   * Actualizar un sabor
   *
   * @param id id del sabor a actualizar
   * @param brandDTO objeto de actualizacion del sabor
   */
  async update(id: number, brandDTO: FlavorDTO): Promise<UpdateResult> {
    const flavor = await getRepository(FlavorEntity).findOne(id, {});
    flavor.nombre = brandDTO.nombre;
    flavor.html = brandDTO.html;
    flavor.active = brandDTO.active;
    return await getRepository(FlavorEntity).update(id, flavor);
  }

  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return await getRepository(FlavorEntity)
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
   * @param {Number} id - el id del flavoro a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(FlavorEntity).delete(id);
  }
  /**
   * Pagionacion de sabores
   *
   * @param options opciones de paginacion
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

    const data = await getRepository(FlavorEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(FlavorEntity).count({ where: [filters] }),
    };
  }
}
