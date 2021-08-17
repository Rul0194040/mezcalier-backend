import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from '../../owner/products/products.service';
import { ProfileTypes } from '../profiles/model/profiles.enum';

@Controller('admin/products')
@UseGuards(JwtAuthGuard)
@Profiles(ProfileTypes.ADMIN)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * listar todos los productos existentes
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult}
   */
  @Post('paginate')
  paginate(
    @Body() opciones: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.productsService.adminPaginate(opciones);
  }
}
