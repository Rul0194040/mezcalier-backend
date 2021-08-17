import { Module } from '@nestjs/common';
import { ProductsController } from './adminProducts.controller';
import { ProductsService } from '../../owner/products/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
