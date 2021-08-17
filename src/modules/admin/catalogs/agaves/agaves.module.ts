import { Module } from '@nestjs/common';
import { AgavesController } from '@mezcal/modules/admin/catalogs/agaves/agaves.controller';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { AgavesService } from '@mezcal/modules/admin/catalogs/agaves/agaves.service';
import { ImagesModule } from '@mezcal/common/images/images.module';
import { CloudvisionModule } from '@mezcal/modules/cloudvision/cloudvision.module';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [ImagesModule, CloudvisionModule],
  controllers: [AgavesController],
  providers: [AgavesService, MyLogger, CloudvisionService],
  exports: [AgavesService],
})
export class AgavesModule {}
