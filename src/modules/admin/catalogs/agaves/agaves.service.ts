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
import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';
import { AgaveDTO } from '@mezcal/modules/admin/catalogs/agaves/model/agave.dto';
/**
 * Service para usuarios
 */
@Injectable()
export class AgavesService {
  /**
   * Cambiar el estado de un agave
   * @param {number} id el id del agave a cambiar su estado
   * @param {boolean} status El estado a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return getRepository(AgaveEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('id=:id', { id: id })
      .execute();
  }
  /**
   * Listado de agaves
   */
  async get(): Promise<AgaveEntity[]> {
    return await getRepository(AgaveEntity).find({ relations: ['images'] });
  }
  /**
   * Obtener agave por id
   * @param id id del agave
   */
  async getById(id: number): Promise<AgaveEntity> {
    return await getRepository(AgaveEntity).findOne(id, {
      relations: ['images'],
    });
  }
  /**
   * Creacion de agaves
   *
   * @param agaveDTO objeto del agave a crear
   */
  async create(agaveDTO: AgaveDTO): Promise<AgaveEntity> {
    const agaveToCreate = new AgaveEntity(
      undefined,
      undefined,
      agaveDTO.nombre,
      agaveDTO.descripcion,
      agaveDTO.nombreCientifico,
      agaveDTO.nombresConocidos,
      true,
      agaveDTO.distribucion,
      agaveDTO.comentarioTaxonomico,
      agaveDTO.habitat,
      agaveDTO.uso,
      agaveDTO.probabilidadExistencia,
      agaveDTO.html,
    );

    return await getRepository(AgaveEntity).save(agaveToCreate);
  }
  /**
   *
   * @param id id del agave a actualizar
   * @param agaveDTO objeto del agave a crear
   */
  async update(id: number, agaveDTO: AgaveDTO): Promise<UpdateResult> {
    const agave = await getRepository(AgaveEntity).findOne(id, {});
    agave.nombre = agaveDTO.nombre;
    agave.descripcion = agaveDTO.descripcion;
    agave.nombreCientifico = agaveDTO.nombreCientifico;
    agave.nombresConocidos = agaveDTO.nombresConocidos;
    agave.html = agaveDTO.html;
    agave.active = agaveDTO.active;
    agave.distribucion = agaveDTO.distribucion;
    agave.comentarioTaxonomico = agaveDTO.comentarioTaxonomico;
    agave.habitat = agaveDTO.habitat;
    agave.uso = agaveDTO.uso;
    agave.probabilidadExistencia = agaveDTO.probabilidadExistencia;
    return await getRepository(AgaveEntity).update(id, agave);
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del agaveo a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(AgaveEntity).delete(id);
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

    const data = await getRepository(AgaveEntity).find({
      where: [filters],
      relations: ['images'],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(AgaveEntity).count({ where: [filters] }),
    };
  }
}
