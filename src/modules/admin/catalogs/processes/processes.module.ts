import { ImagesService } from '@mezcal/common/images/images.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { ProcessesController } from '@mezcal/modules/admin/catalogs/processes/processes.controller';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { ProcessesService } from '@mezcal/modules/admin/catalogs/processes/processes.service';
import { CloudvisionModule } from '../../../cloudvision/cloudvision.module';
import { CloudvisionService } from '../../../cloudvision/cloudvision.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [TypeOrmModule.forFeature([ProcesseEntity]), CloudvisionModule],
  controllers: [ProcessesController],
  providers: [ProcessesService, MyLogger, ImagesService, CloudvisionService],
  exports: [ProcessesService],
})
export class ProcessesModule {}
