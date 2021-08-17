import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { mezcalTypesController } from '@mezcal/modules/admin/catalogs/mezcalTypes/mezcalTypes.controller';
import { MyLogger } from '@mezcal//common/services/logger.service';
import { MezcalTypesService } from '@mezcal/modules/admin/catalogs/mezcalTypes/mezcalTypes.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [TypeOrmModule.forFeature([MezcalTypeEntity])],
  controllers: [mezcalTypesController],
  providers: [MezcalTypesService, MyLogger],
  exports: [MezcalTypesService],
})
export class mezcalTypesModule {}
