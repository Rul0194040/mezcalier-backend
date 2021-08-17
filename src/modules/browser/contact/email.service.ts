import { EmailDTO } from './email.dto';
import { Injectable } from '@nestjs/common';
import { forIn } from 'lodash';
import { getRepository, Like, Equal, DeleteResult } from 'typeorm';
import { EmailEntity } from './email.entity';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';

@Injectable()
export class EmailService {
  /**
   * Mostrar un email
   *
   */
  async get(): Promise<EmailEntity[]> {
    return await getRepository(EmailEntity).find({ active: true });
  }

  async getEmailById(id: number): Promise<EmailEntity> {
    return await getRepository(EmailEntity).findOne({ id: id, active: true });
  }

  /**
   * Guardado de emails de admin
   *
   * @param emailDTO objeto del cooking a crear
   */
  async save(email: EmailDTO): Promise<void> {
    await getRepository(EmailEntity).save(email);
  }

  /**
   * Delete
   *
   * Usando el delete
   *
   * @param {Number} id - el id del email a borrar
   *
   * @returns {DeleteResult} - el resultado de borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await getRepository(EmailEntity).delete(id);
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

    const data = await getRepository(EmailEntity).find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await getRepository(EmailEntity).count({
        where: [filters],
      }),
    };
  }
}
