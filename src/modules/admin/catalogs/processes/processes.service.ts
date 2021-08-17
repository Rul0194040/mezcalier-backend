import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { ProcesseDTO } from '@mezcal/modules/admin/catalogs/processes/model/processe.dto';
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
  //getConnection,
} from 'typeorm';
/**
 * Service para usuarios
 */
@Injectable()
export class ProcessesService {
  /*
  async patchMillingsAdd(idProcesse: number, idMilling: number): Promise<void> {
    return await getConnection()
      .createQueryBuilder()
      .relation(ProcesseEntity, 'millings')
      .of(idProcesse)
      .add(idMilling);
  }

  async patchMillingsRemove(
    idProcesse: number,
    idMilling: number,
  ): Promise<void> {
    return await getConnection()
      .createQueryBuilder()
      .relation(ProcesseEntity, 'millings')
      .of(ProcesseEntity)
      .remove(idMilling);
  }
  */
  /**
   * listado de procesos
   */
  async get(): Promise<ProcesseEntity[]> {
    return await getRepository(ProcesseEntity).find({ relations: ['images'] });
  }
  /**
   * Obtener un proceso por su id
   *
   * @param id id del proceso
   */
  async getById(id: number, full = false): Promise<ProcesseEntity> {
    let rels = ['images', 'millings', 'distillings', 'cookings', 'fermentings'];
    if (!full) {
      rels = ['images'];
    }
    const proc = await getRepository(ProcesseEntity).findOne(id, {
      where: { active: true },
      relations: rels,
    });
    if (!proc) {
      throw new HttpException('No existe ese proceso', HttpStatus.NOT_FOUND);
    }
    return proc;
  }
  /**
   * Creacion de un proceso en la base de datos
   *
   * @param processeDTO objeto de proceso a crear
   */
  async create(processeDTO: ProcesseDTO): Promise<ProcesseEntity> {
    const processeToCreate = new ProcesseEntity(
      undefined,
      undefined,
      processeDTO.nombre,
      processeDTO.descripcion,
      processeDTO.html,
      true,
    );

    return await getRepository(ProcesseEntity).save(processeToCreate);
  }
  /**
   * Actualizacion de proceso
   *
   * @param id
   * @param brandDTO
   */
  async update(id: number, brandDTO: ProcesseDTO): Promise<UpdateResult> {
    return await getRepository(ProcesseEntity)
      .createQueryBuilder()
      .update()
      .set({
        nombre: brandDTO.nombre,
        descripcion: brandDTO.descripcion,
        html: brandDTO.html,
        active: brandDTO.active,
      })
      .where('id=:id', { id: id })
      .execute();
  }

  /**
   * Cambia el estado de una region
   *
   * @param id de la region a cambiar
   * @param {boolean} active estatus a establecer
   */
  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return await getRepository(ProcesseEntity)
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
   * @param {Number} id - el id del processeo a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(ProcesseEntity).delete(id);
  }
  /**
   * Paginacion de procesos
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

    const data = await getRepository(ProcesseEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(ProcesseEntity).count({
        where: [filters],
      }),
    };
  }
}
