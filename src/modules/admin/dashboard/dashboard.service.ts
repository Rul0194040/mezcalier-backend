import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { ProductEntity } from '../../product.entity';
import { DashboardDTO } from './dashboard.dto';
import { BrandEntity } from '../../brand.entity';
import { HouseEntity } from '../../house.entity';
import { UserEntity } from '../users/model/user.entity';

@Injectable()
export class DashboardService {
  async getData(): Promise<DashboardDTO> {
    const casas = await getRepository(HouseEntity)
      .createQueryBuilder()
      .getCount();

    const marcas = await getRepository(BrandEntity)
      .createQueryBuilder()
      .getCount();

    const productos = await getRepository(ProductEntity)
      .createQueryBuilder()
      .getCount();

    const usuarios = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .where('profile.name = :perfil', { perfil: 'public' })
      .getCount();

    return {
      casas,
      marcas,
      productos,
      usuarios,
    };
  }
}
