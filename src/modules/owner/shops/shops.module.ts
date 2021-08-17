import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { ShopsController } from '@mezcal/modules/owner/shops/shops.controller';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { ShopsService } from '@mezcal/modules/owner/shops/shops.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [TypeOrmModule.forFeature([ShopEntity])],
  controllers: [ShopsController],
  providers: [ShopsService, MyLogger],
  exports: [ShopsService],
})
export class ShopsModule {}
