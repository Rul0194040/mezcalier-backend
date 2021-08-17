/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Body,
} from '@nestjs/common';

import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { ShopDTO } from '@mezcal/modules/owner/shops/model/shop.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { ShopsService } from '@mezcal/modules/owner/shops/shops.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ShopEntity } from './model/shop.entity';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { Rules } from '@mezcal/common/decorators/rules.decorator';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('owner')
@Controller('owner')
@Profiles(ProfileTypes.OWNER)
@UseGuards(JwtAuthGuard)
export class ShopsController {
  /**
   * Servicios utilizados
   * @param shopsService
   * @param logger
   */
  constructor(private readonly shopsService: ShopsService) {}
  /**
   * Api: GET /api/v1/shops/:id
   *
   * @param {number} id el id del shopo a actualizar
   * @returns {ShopDTO} - el shopo de la base de datos
   */
  @Rules('view:shops')
  @Get('shops/:id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<ShopEntity> {
    return this.shopsService.getById(id);
  }

  /**
   * Api: PUT /api/v1/shopos/:id
   *
   * @param {number} id el id del shopo a actualizar
   * @param {ShopDTO} shop los cambios al shopo
   * @returns {ShopDTO} - el shopo de la base de datos
   */
  @Rules('update:shops')
  @Put('shops/:id')
  updateShop(
    @Param('id') id: number,
    @Body() shop: ShopDTO,
  ): Promise<UpdateResult> {
    return this.shopsService.update(id, shop);
  }

  /**
   * Elimina un shopo de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * Otra linea.
   *
   * @param {number} id el shopo a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Rules('delete:shops')
  @Delete('shops/:id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.shopsService.delete(id);
  }

  /**
   * Api: GET /api/v1/shopos
   *
   * @returns {ShopDTO[]} shopos
   */
  @Rules('view:shops')
  @Get('shops/get-house-id/:id')
  getHouseId(@Param('id') id: number): Promise<ShopEntity[]> {
    return this.shopsService.getHouseId(id);
  }

  /**
   * Api: POST /api/v1/shopos
   *
   * @param {ShopDTO} shop shopo a crear.
   * @returns {ShopDTO} shop
   */
  @Rules('create:shops')
  @Post('shops')
  post(@Body() shop: ShopDTO): Promise<ShopEntity> {
    return this.shopsService.create(shop);
  }

  /**
   * Api: POST /api/v1/shopos/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Rules('view:shops')
  @Post('shops/paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.shopsService.paginate(options);
  }
}
