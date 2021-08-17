import { Injectable } from '@nestjs/common';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { ProfileDTO } from '@mezcal/modules/admin/profiles/model/profile.dto';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { forIn } from 'lodash';
import { Like, Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
/**
 * Service de profiles
 */
@Injectable()
export class ProfilesService {
  /**
   * @ignore
   */
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profilesRepository: Repository<ProfileEntity>,
  ) {}

  /**
   * Obtener todos los perfiles con sus reglas
   */
  async get(): Promise<ProfileEntity[]> {
    return await this.profilesRepository.find({
      relations: ['rules'],
    });
  }

  /**
   * Obtener perfil por Id
   *
   * @param id
   */
  async getById(id: number): Promise<ProfileEntity> {
    return await this.profilesRepository.findOne(id, {
      relations: ['rules'],
    });
  }

  /**
   * Obtener perfil por nombre
   *
   * @param name
   */
  getByName(name: string): Promise<ProfileEntity> {
    return this.profilesRepository.findOne(
      { name: name },
      { relations: ['rules'] },
    );
  }

  /**
   * Crear nuevo perfil
   *
   * @param profile
   */
  async create(profile: ProfileDTO): Promise<ProfileEntity> {
    const createProfile: ProfileEntity = new ProfileEntity(
      undefined,
      profile.name,
      profile.rules,
    );
    return await this.profilesRepository.save(createProfile);
  }
  /**
   * Actualizacion de perfil
   *
   * @param id id del perfil
   * @param profileDTO cambios al perfil
   */
  async update(id: number, profileDTO: ProfileDTO): Promise<ProfileEntity> {
    const oldProfile = await this.profilesRepository.findOne(id, {
      relations: ['rules'],
    });
    oldProfile.name = profileDTO.name;
    oldProfile.rules.map((rule) => {
      return new RuleEntity(rule.id, rule.name, rule.description, rule.value);
    }),
      await this.profilesRepository.save(oldProfile);
    return await this.profilesRepository.findOne(id);
  }

  /**
   * Paginacion de perfiles
   * @param {PaginationPrimeNG} options Opciones de paginacion
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

    const data = await this.profilesRepository.find({
      relations: ['rules'],
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await this.profilesRepository.count({ where: [filters] }),
    };
  }
}
