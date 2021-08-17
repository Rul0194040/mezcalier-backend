import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopEntity } from '../../owner/shops/model/shop.entity';
import { ShopsService } from '../../owner/shops/shops.service';
import { AdminShopsController } from './adminShops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShopEntity])],
  providers: [ShopsService],
  controllers: [AdminShopsController],
  exports: [ShopsService],
})
export class AdminShopsModule {}
