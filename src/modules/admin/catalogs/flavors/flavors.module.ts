import { Module } from '@nestjs/common';
import { FlavorsController } from '@mezcal/modules/admin/catalogs/flavors/flavors.controller';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { FlavorsService } from '@mezcal/modules/admin/catalogs/flavors/flavors.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [],
  controllers: [FlavorsController],
  providers: [FlavorsService, MyLogger],
  exports: [FlavorsService],
})
export class FlavorsModule {}
