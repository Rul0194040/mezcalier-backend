import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegionEntity } from '@mezcal/modules/admin/catalogs/regions/model/region.entity';
import { RegionDTO } from '@mezcal/modules/admin/catalogs/regions/model/region.dto';
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
/**
 * Service para usuarios
 */
@Injectable()
export class RegionsService {
  /**
   * Listado de regiones
   */
  async get(): Promise<RegionEntity[]> {
    return await getRepository(RegionEntity).find({ relations: ['images'] });
  }
  /**
   * Obtener region por id
   *
   * @param id
   */
  async getById(id: number): Promise<RegionEntity> {
    const product = await getRepository(RegionEntity).findOne(id, {
      where: { active: true },
      relations: ['images'],
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
   * Creacion de una region
   *
   * @param regionDTO
   */
  async create(regionDTO: RegionDTO): Promise<RegionEntity> {
    const regionToCreate = new RegionEntity(
      undefined,
      undefined,
      regionDTO.nombre,
      regionDTO.estado,
      regionDTO.descripcion,
      regionDTO.html,
      true,
    );

    return await getRepository(RegionEntity).save(regionToCreate);
  }
  /**
   * Actualizacion de una region
   *
   * @param id
   * @param regionDTO
   */
  async update(id: number, regionDTO: RegionDTO): Promise<UpdateResult> {
    const region = await getRepository(RegionEntity).findOne(id, {});
    region.nombre = regionDTO.nombre;
    region.descripcion = regionDTO.descripcion;
    region.html = regionDTO.html;
    region.active = regionDTO.active;
    return await getRepository(RegionEntity).update(id, region);
  }

  /**
   * Cambia el estado de una region
   *
   * @param id de la region a cambiar
   * @param {boolean} active estatus a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return await getRepository(RegionEntity)
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
   * @param {Number} id - el id del regiono a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(RegionEntity).delete(id);
  }
  /**
   * Paginacion de regiones
   *
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

    const data = await getRepository(RegionEntity).find({
      where: [filters],
      relations: ['images'],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(RegionEntity).count({ where: [filters] }),
    };
  }
}
