import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { getConnection, getRepository } from 'typeorm';
import { ProcesseEntity } from './admin/catalogs/processes/model/processe.entity';
import { MezcalTypeEntity } from './admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { FlavorEntity } from './admin/catalogs/flavors/model/flavor.entity';
import { ProcessesToCreate } from './admin/catalogs/processes/processes.collection';
import { FlavorsToCreate } from './admin/catalogs/flavors/flavors.collection';
import { MezcalTypesToCreate } from './admin/catalogs/mezcalTypes/mezcalTypes.collection';
import { AgaveEntity } from './admin/catalogs/agaves/model/agave.entity';
import { AgavesToCreate } from './admin/catalogs/agaves/agaves.collection';
import { RegionsToCreate } from './admin/catalogs/regions/regions.collection';
import { RegionEntity } from './admin/catalogs/regions/model/region.entity';
import { CookingsToCreate } from './admin/catalogs/cooking/cooking.collection';
import { CookingEntity } from './admin/catalogs/cooking/cooking.entity';
import { DistillingsToCreate } from './admin/catalogs/distilling/distilling.collection';
import { DistillingEntity } from './admin/catalogs/distilling/distilling.entity';
import { FermentingsToCreate } from './admin/catalogs/fermenting/fermenting.collection';
import { FermentingEntity } from './admin/catalogs/fermenting/fermenting.entity';
import { MillingsToCreate } from './admin/catalogs/milling/milling.collection';
import { MillingEntity } from './admin/catalogs/milling/milling.entity';

/**
 * @ignore
 */
@Injectable()
export class StarterSeeder implements Seeder {
  /**
   * @ignore
   */
  async seed(): Promise<any> {
    const createdFlavors = await getRepository(FlavorEntity).save(
      FlavorsToCreate,
    );

    const createdRegions = await getRepository(RegionEntity).save(
      RegionsToCreate,
    );

    const createdProcesses = await getRepository(ProcesseEntity).save(
      ProcessesToCreate,
    );

    const createdCookings = await getRepository(CookingEntity).save(
      CookingsToCreate,
    );

    const createdTypes = await getRepository(MezcalTypeEntity).save(
      MezcalTypesToCreate,
    );

    const createdAgaves = await getRepository(AgaveEntity).save(AgavesToCreate);

    const createdMillings = await getRepository(MillingEntity).save(
      MillingsToCreate,
    );

    const createdDistillings = await getRepository(DistillingEntity).save(
      DistillingsToCreate,
    );

    const createdFermentings = await getRepository(FermentingEntity).save(
      FermentingsToCreate,
    );

    const cm = getConnection().createQueryBuilder();
    //crear relaciones con moliendas al proceso 1
    await cm.relation(ProcesseEntity, 'millings').of(1).add(1);
    await cm.relation(ProcesseEntity, 'millings').of(1).add(2);
    await cm.relation(ProcesseEntity, 'millings').of(1).add(3);
    await cm.relation(ProcesseEntity, 'millings').of(1).add(4);
    await cm.relation(ProcesseEntity, 'millings').of(1).add(5);
    await cm.relation(ProcesseEntity, 'millings').of(1).add(7);

    //crear relaciones con moliendas al proceso 2
    await cm.relation(ProcesseEntity, 'millings').of(2).add(6);
    await cm.relation(ProcesseEntity, 'millings').of(2).add(1);
    await cm.relation(ProcesseEntity, 'millings').of(2).add(2);

    await cm.relation(ProcesseEntity, 'millings').of(2).add(3);
    await cm.relation(ProcesseEntity, 'millings').of(2).add(4);

    //crear relaciones con moliendas al proceso 3
    await cm.relation(ProcesseEntity, 'millings').of(3).add(6);
    await cm.relation(ProcesseEntity, 'millings').of(3).add(1);
    await cm.relation(ProcesseEntity, 'millings').of(3).add(2);

    await cm.relation(ProcesseEntity, 'cookings').of(1).add(1);
    await cm.relation(ProcesseEntity, 'cookings').of(1).add(4);
    await cm.relation(ProcesseEntity, 'cookings').of(1).add(3);
    await cm.relation(ProcesseEntity, 'cookings').of(2).add(1);
    await cm.relation(ProcesseEntity, 'cookings').of(2).add(2);
    await cm.relation(ProcesseEntity, 'cookings').of(3).add(1);

    await cm.relation(ProcesseEntity, 'fermentings').of(1).add(1);
    await cm.relation(ProcesseEntity, 'fermentings').of(1).add(2);
    await cm.relation(ProcesseEntity, 'fermentings').of(1).add(3);

    await cm.relation(ProcesseEntity, 'fermentings').of(2).add(4);
    await cm.relation(ProcesseEntity, 'fermentings').of(2).add(2);
    await cm.relation(ProcesseEntity, 'fermentings').of(2).add(1);
    await cm.relation(ProcesseEntity, 'fermentings').of(2).add(5);
    await cm.relation(ProcesseEntity, 'fermentings').of(2).add(6);
    await cm.relation(ProcesseEntity, 'fermentings').of(2).add(8);
    await cm.relation(ProcesseEntity, 'fermentings').of(2).add(7);

    await cm.relation(ProcesseEntity, 'fermentings').of(3).add(4);
    await cm.relation(ProcesseEntity, 'fermentings').of(3).add(2);
    await cm.relation(ProcesseEntity, 'fermentings').of(3).add(1);
    await cm.relation(ProcesseEntity, 'fermentings').of(3).add(5);
    await cm.relation(ProcesseEntity, 'fermentings').of(3).add(6);

    await cm.relation(ProcesseEntity, 'distillings').of(1).add(1);
    await cm.relation(ProcesseEntity, 'distillings').of(1).add(2);
    await cm.relation(ProcesseEntity, 'distillings').of(1).add(3);

    await cm.relation(ProcesseEntity, 'distillings').of(2).add(7);
    await cm.relation(ProcesseEntity, 'distillings').of(2).add(8);
    await cm.relation(ProcesseEntity, 'distillings').of(2).add(9);
    await cm.relation(ProcesseEntity, 'distillings').of(2).add(10);

    await cm.relation(ProcesseEntity, 'distillings').of(3).add(8);
    await cm.relation(ProcesseEntity, 'distillings').of(3).add(9);

    return {
      createdProcesses,
      createdCookings,
      createdTypes,
      createdFlavors,
      createdAgaves,
      createdMillings,
      createdDistillings,
      createdFermentings,
      createdRegions,
    };
  }
  /**
   * @ignore
   */
  async drop(): Promise<any> {
    await getRepository(FlavorEntity).delete({});
    await getRepository(ProcesseEntity).delete({});
    await getRepository(CookingEntity).delete({});
    await getRepository(MezcalTypeEntity).delete({});
    await getRepository(AgaveEntity).delete({});
    await getRepository(RegionEntity).delete({});
    return true;
  }
}
