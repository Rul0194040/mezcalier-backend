import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionEntity } from '@mezcal/modules/admin/catalogs/regions/model/region.entity';
import { RegionsController } from '@mezcal/modules/admin/catalogs/regions/regions.controller';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { RegionsService } from '@mezcal/modules/admin/catalogs/regions/regions.service';
import { ImagesModule } from '@mezcal/common/images/images.module';
import { CloudvisionModule } from '@mezcal/modules/cloudvision/cloudvision.module';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [
    TypeOrmModule.forFeature([RegionEntity]),
    ImagesModule,
    CloudvisionModule,
  ],
  controllers: [RegionsController],
  providers: [RegionsService, MyLogger, CloudvisionService],
  exports: [RegionsService],
})
export class RegionsModule {}
