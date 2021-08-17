import { Injectable } from '@nestjs/common';
import { CreateDefDTO } from '@mezcal/modules/admin/definitions/dto/create-def.dto';
import { getRepository } from 'typeorm';
import { DefinitionsEntity } from '@mezcal/modules/admin/definitions/definitions.entity';
/**
 * Servicio para las deficiones
 */
@Injectable()
export class DefinitionsService {
  /**
   * Creacion de definiciones
   *
   * @param createDefDTO objeto de definicion
   */
  async create(createDefDTO: CreateDefDTO): Promise<DefinitionsEntity> {
    const definitionsRepository = getRepository(DefinitionsEntity);
    return definitionsRepository.create(createDefDTO);
  }
}
