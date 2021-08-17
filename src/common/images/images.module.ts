import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from '@mezcal/common/images/images.service';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity])],
  controllers: [],
  providers: [ImagesService],
  exports: [ImagesService, TypeOrmModule.forFeature([ImageEntity])],
})
export class ImagesModule {}
