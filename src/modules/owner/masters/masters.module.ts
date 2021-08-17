import { Module } from '@nestjs/common';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { ImagesService } from '@mezcal/common/images/images.service';
import { CloudvisionModule } from '@mezcal/modules/cloudvision/cloudvision.module';
import { CloudvisionService } from '@mezcal/modules/cloudvision/cloudvision.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [ImagesService, CloudvisionModule],
  controllers: [MastersController],
  providers: [MastersService, MyLogger, ImagesService, CloudvisionService],
  exports: [MastersService],
})
export class MastersModule {}
