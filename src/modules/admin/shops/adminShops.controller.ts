import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { ProfileTypes } from '../profiles/model/profiles.enum';
import { ShopsService } from '../../owner/shops/shops.service';
import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { ShopDTO } from '@mezcal/modules/owner/shops/model/shop.dto';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin/shops')
@Profiles(ProfileTypes.ADMIN)
@UseGuards(JwtAuthGuard)
export class AdminShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  /**
   * actualiza el estado de una shop
   * @param id id de la shop a actualizar status
   * @param active estado de la shop true / false
   * @param user usuario en sesión
   */
  @ApiOperation({ summary: 'Actualizar el estado de una shop' })
  @Rules('update:shops')
  @Put(':id/status')
  updateShopStatus(
    @Param('id') id: number,
    @Body('active', ParseBoolPipe) active: boolean,
  ): Promise<UpdateResult> {
    return this.shopsService.updateStatus(id, active);
  }

  /**
   * Pagina las tiendas para admin
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @ApiOperation({ summary: 'Paginar las shops' })
  @Rules('view:shops')
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.shopsService.paginate(options);
  }

  // TODO: corregir el crear tienda
  @ApiOperation({ summary: 'crear shops' })
  @Rules('create:shops')
  @Post()
  post(@Body() shop: ShopDTO): Promise<ShopEntity> {
    return this.shopsService.create(shop);
  }

  /**
   * Actualizar una shop
   *
   * @param id id de la tienda
   * @param shop datos a actualizar
   * @param user usuario en sesion
   * @returns {UpdateResult} resultados de la actualizacion
   */
  @ApiOperation({ summary: 'actualizar shops' })
  @Rules('update:shops')
  @Put(':id')
  updateShop(
    @Param('id') id: number,
    @Body() shop: ShopDTO,
  ): Promise<UpdateResult> {
    return this.shopsService.update(id, shop);
  }

  /**
   * Obtiene una tienda por id
   *
   * @param id id de la shop
   * @param user usuario en sesion
   * @returns {ShopEntity} tienda
   */
  @ApiOperation({ summary: 'obtener shop por id' })
  @Rules('view:shops')
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<ShopEntity> {
    return this.shopsService.getById(id);
  }
}
