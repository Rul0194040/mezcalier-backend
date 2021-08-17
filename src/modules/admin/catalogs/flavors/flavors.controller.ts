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

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { FlavorDTO } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.dto';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { FlavorsService } from '@mezcal/modules/admin/catalogs/flavors/flavors.service';
import { ParseBoolPipe } from '@nestjs/common';
import { FlavorEntity } from './model/flavor.entity';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('flavors')
@Controller('admin/catalogs/flavors')
@UseGuards(JwtAuthGuard)
export class FlavorsController {
  /**
   * Servicios utilizados
   * @param flavorsService
   * @param logger
   */
  constructor(private readonly flavorsService: FlavorsService) {}
  /**
   * Api: GET /api/v1/flavoros/:id
   *
   * @param {number} id el id del flavoro a actualizar
   * @returns {FlavorDTO} - el flavoro de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<FlavorEntity> {
    return this.flavorsService.getById(id);
  }

  /**
   * Api: PUT /api/v1/flavoros/:id
   *
   * @param {number} id el id del flavoro a actualizar
   * @param {FlavorDTO} flavor los cambios al flavoro
   * @returns {FlavorDTO} - el flavoro de la base de datos
   */
  @Put(':id')
  updateFlavor(
    @Param('id') id: number,
    @Body() flavor: FlavorDTO,
  ): Promise<UpdateResult> {
    return this.flavorsService.update(id, flavor);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) active: boolean,
  ): Promise<UpdateResult> {
    return this.flavorsService.updateStatus(id, active);
  }

  /**
   * Elimina un flavoro de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * Otra linea.
   *
   * @param {number} id el flavoro a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.flavorsService.delete(id);
  }

  /**
   * Api: GET /api/v1/flavoros
   *
   * @returns {FlavorDTO[]} flavoros
   */
  @Get()
  get(): Promise<FlavorEntity[]> {
    return this.flavorsService.get();
  }

  /**
   * Api: POST /api/v1/flavoros
   *
   * @param {FlavorDTO} flavor flavoro a crear.
   * @returns {FlavorDTO} flavor
   */
  @Post()
  post(@Body() flavor: FlavorDTO): Promise<FlavorEntity> {
    return this.flavorsService.create(flavor);
  }

  /**
   * Api: POST /api/v1/flavoros/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.flavorsService.paginate(options);
  }
}
