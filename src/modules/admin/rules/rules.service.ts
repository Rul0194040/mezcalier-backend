import { Injectable } from '@nestjs/common';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { RuleDTO } from '@mezcal/modules/admin/rules/model/rule.dto';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { forIn } from 'lodash';
import { Like, Equal, Repository, DeleteResult, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
/**
 * Rules Service
 */
@Injectable()
export class RulesService {
  /**
   * @ignore
   */
  constructor(
    @InjectRepository(RuleEntity)
    private readonly rulesRepository: Repository<RuleEntity>,
  ) {}
  /**
   * Listar todas las reglas
   */
  async getAllRules(): Promise<RuleEntity[]> {
    return await this.rulesRepository.find({});
  }
  /**
   * Obtener reglas por id
   *
   * @param id id de la regla
   */
  async getRuleById(id: number): Promise<RuleEntity> {
    return await this.rulesRepository.findOne(id);
  }
  /**
   * Obtener regla por su valor
   *
   * @param value valor de la regla a obtener
   */
  async getByValue(value: string): Promise<RuleEntity> {
    return this.rulesRepository.findOne({ value: value });
  }
  /**
   * Creacion de reglas
   * @param rule objeto de regla a crear
   */
  async create(rule: RuleDTO): Promise<RuleEntity> {
    const ruleToCreate: RuleEntity = new RuleEntity(
      undefined,
      rule.name,
      rule.description,
      rule.value,
    );
    return await this.rulesRepository.save(ruleToCreate);
  }

  async update(id: number, ruleDTO: RuleDTO): Promise<UpdateResult> {
    const rule = await this.rulesRepository.findOne(id, {});
    rule.name = ruleDTO.name;
    rule.description = ruleDTO.description;
    rule.value = ruleDTO.value;
    return await this.rulesRepository.update(id, rule);
  }

  async deleteRule(id: number): Promise<DeleteResult> {
    return this.rulesRepository.delete(id);
  }

  async getAll(options: PaginationPrimeNG): Promise<PaginationPrimeNgResult> {
    const filters = {};
    forIn(options.filters, (value, key) => {
      if (value.matchMode === 'Like') {
        filters[key] = Like(`%${value.value}%`);
      }
      if (value.matchMode === 'Equal') {
        filters[key] = Equal(`${value.value}`);
      }
    });
    const data = await this.rulesRepository.find({
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });
    return {
      data,
      skip: options.skip,
      totalItems: await this.rulesRepository.count({ where: [filters] }),
    };
  }
}
