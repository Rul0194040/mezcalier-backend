import { AgavesService } from '@mezcal/modules/admin/catalogs/agaves/agaves.service';
import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';
import { FlavorsService } from '@mezcal/modules/admin/catalogs/flavors/flavors.service';
import { FlavorEntity } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.entity';
import { RegionEntity } from '@mezcal/modules/admin/catalogs/regions/model/region.entity';
import { RegionsService } from '@mezcal/modules/admin/catalogs/regions/regions.service';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProcessesService } from '@mezcal/modules/admin/catalogs/processes/processes.service';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { ShopsService } from '@mezcal/modules/owner/shops/shops.service';
import { MastersService } from '@mezcal/modules/owner/masters/masters.service';
import { MasterEntity } from '../../owner/masters/model/master.entity';
import { ShopEntity } from '../../owner/shops/model/shop.entity';
import { MezcalTypesService } from '@mezcal/modules/admin/catalogs/mezcalTypes/mezcalTypes.service';
import { CookingService } from '@mezcal/modules/admin/catalogs/cooking/cooking.service';
import { CookingEntity } from '@mezcal/modules/admin/catalogs/cooking/cooking.entity';
import { MillingService } from '@mezcal/modules/admin/catalogs/milling/milling.service';
import { MillingEntity } from '@mezcal/modules/admin/catalogs/milling/milling.entity';
import { DistillingEntity } from '@mezcal/modules/admin/catalogs/distilling/distilling.entity';
import { DistillingService } from '@mezcal/modules/admin/catalogs/distilling/distilling.service';
import { FermentingEntity } from '@mezcal/modules/admin/catalogs/fermenting/fermenting.entity';
import { FermentingService } from '@mezcal/modules/admin/catalogs/fermenting/fermenting.service';
/**
 * Controller publico para la obtencion de los catalogos.
 *
 * para uso en los filters
 */
@Controller('browse/catalogs')

// GET /api/v1/browse/catalogs/agaves|todos
export class CatalogsController {
  /**
   * @ignore
   */
  constructor(
    private readonly agavesService: AgavesService,
    private readonly flavorsService: FlavorsService,
    private readonly regionsService: RegionsService,
    private readonly mezcalTypesService: MezcalTypesService,
    private readonly processesService: ProcessesService,
    private readonly shopsService: ShopsService,
    private readonly mastersService: MastersService,
    private readonly cookingsService: CookingService,
    private readonly millingsService: MillingService,
    private readonly distillingsService: DistillingService,
    private readonly fermentingsService: FermentingService,
  ) {}

  @Get('cookings')
  async getCookings(): Promise<CookingEntity[]> {
    return await this.cookingsService.get();
  }

  @Get('cookings/:id')
  async getCookingById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CookingEntity> {
    return await this.cookingsService.getCookingById(id);
  }

  @Get('millings')
  async getMillings(): Promise<MillingEntity[]> {
    return await this.millingsService.get();
  }

  @Get('millings/:id')
  async getMillingById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MillingEntity> {
    return await this.millingsService.getMillingById(id);
  }

  @Get('distillings')
  async getDistillings(): Promise<DistillingEntity[]> {
    return await this.distillingsService.get();
  }

  @Get('distillings/:id')
  async getDistillingById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DistillingEntity> {
    return await this.distillingsService.getDistillingById(id);
  }

  @Get('fermentings')
  async getFermentings(): Promise<FermentingEntity[]> {
    return await this.fermentingsService.get();
  }

  @Get('fermentings/:id')
  async getFermentingById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FermentingEntity> {
    return await this.fermentingsService.getFermentingById(id);
  }

  /**
   * Obtiene el catalogo completo de agaves
   */
  @Get('agaves')
  async getAgaves(): Promise<AgaveEntity[]> {
    return await this.agavesService.get();
  }

  @Get('agaves/:id')
  async getAgave(@Param('id', ParseIntPipe) id: number) {
    return await this.agavesService.getById(id);
  }

  /**
   * obtiene un solo sabor por id
   */
  @Get('flavors/:id')
  async getFlavor(@Param('id', ParseIntPipe) id: number) {
    return await this.flavorsService.getById(id);
  }

  /**
   * Obtiene el catalogo completo de sabores
   */
  @Get('flavors')
  async getFlavors(): Promise<FlavorEntity[]> {
    return await this.flavorsService.get();
  }

  /**
   * Obtiene el catalogo completo de regiones
   */
  @Get('regions')
  async getRegions(): Promise<RegionEntity[]> {
    return await this.regionsService.get();
  }

  @Get('regions/:id')
  async getRegion(@Param('id', ParseIntPipe) id: number) {
    return await this.regionsService.getById(id);
  }

  /**
   * Obtiene el catalogo completo de los tipos de mezcal
   */
  @Get('mezcaltypes')
  async getMezcaltypes() {
    return await this.mezcalTypesService.get();
  }

  @Get('mezcaltypes/:id')
  async getMezcaltype(@Param('id', ParseIntPipe) id: number) {
    return await this.mezcalTypesService.getById(id);
  }

  /**
   * obtiene el catalogo completo de los procesos
   */
  @Get('processes')
  async getProcesses() {
    return await this.processesService.get();
  }

  /**
   * obtiene el proceso por id
   */
  @Get('processes/:id')
  async getProcess(@Param('id', ParseIntPipe) id: number) {
    return await this.processesService.getById(id, true);
  }

  /**
   * Obtener tiendas
   */
  @Get('shops')
  async getShops() {
    return await this.shopsService.get();
  }

  @Get('shops/:id')
  async getShop(@Param('id', ParseIntPipe) id: number) {
    return await this.shopsService.getById(id);
  }

  /**
   * obtener maestros
   */
  @Get('masters')
  async getMasters() {
    return await this.mastersService.get();
  }

  @Get('masters/:id')
  async getMaster(@Param('id', ParseIntPipe) id: number) {
    return await this.mastersService.getById(id);
  }

  @Get('todos')
  async gettodos(): Promise<{
    agaves: AgaveEntity[];
    flavors: FlavorEntity[];
    regions: RegionEntity[];
    mezcaltypes: MezcalTypeEntity[];
    processes: ProcesseEntity[];
    shops: ShopEntity[];
    masters: MasterEntity[];
  }> {
    return {
      agaves: await this.agavesService.get(),
      flavors: await this.flavorsService.get(),
      regions: await this.regionsService.get(),
      mezcaltypes: await this.mezcalTypesService.get(),
      processes: await this.processesService.get(),
      shops: await this.shopsService.get(),
      masters: await this.mastersService.get(),
    };
  }
}
