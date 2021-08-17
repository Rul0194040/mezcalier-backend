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
import { MezcalTypeDTO } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ParseBoolPipe } from '@nestjs/common';
import { MezcalTypesService } from './mezcalTypes.service';

/**
 * Controlador de usuarios
 */

@ApiBearerAuth()
@ApiTags('mezcalTypes')
@Controller('admin/catalogs/mezcalTypes')
@UseGuards(JwtAuthGuard)
export class mezcalTypesController {
  /**
   * Servicios utilizados
   * @param mezcalTypesService
   * @param logger
   */
  constructor(private readonly mezcalTypesService: MezcalTypesService) {}
  /**
   * Api: GET /api/v1/mezcalTypeos/:id
   *
   * @param {number} id el id del mezcalTypeo a actualizar
   * @returns {mezcalTypeDTO} - el mezcalTypeo de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<MezcalTypeDTO> {
    return this.mezcalTypesService.getById(id);
  }

  /**
   * Api: PUT /api/v1/mezcalTypeos/:id
   *
   * @param {number} id el id del mezcalTypeo a actualizar
   * @param {mezcalTypeDTO} mezcalType los cambios al mezcalTypeo
   * @returns {mezcalTypeDTO} - el mezcalTypeo de la base de datos
   */
  @Put(':id')
  updatemezcalType(
    @Param('id') id: number,
    @Body() mezcalType: MezcalTypeDTO,
  ): Promise<UpdateResult> {
    return this.mezcalTypesService.update(id, mezcalType);
  }

  /**
   * Cambia el estado de una region
   *
   * @param id de la region a cambiar
   * @param {boolean} active estatus a establecer
   */
  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) active: boolean,
  ): Promise<UpdateResult> {
    return this.mezcalTypesService.updateStatus(id, active);
  }

  /**
   * Elimina un mezcalTypeo de la base de datos, se verifica que sea de la casa que
   * esta intentando hacer el borrado.
   *
   * Otra linea.
   *
   * @param {number} id el mezcalTypeo a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.mezcalTypesService.delete(id);
  }

  /**
   * Api: GET /api/v1/mezcalTypeos
   *
   * @returns {mezcalTypeDTO[]} mezcalTypeos
   */
  @Get()
  get(): Promise<MezcalTypeDTO[]> {
    return this.mezcalTypesService.get();
  }

  /**
   * Api: POST /api/v1/mezcalTypeos
   *
   * @param {mezcalTypeDTO} mezcalType mezcalTypeo a crear.
   * @returns {mezcalTypeDTO} mezcalType
   */
  @Post()
  post(@Body() mezcalType: MezcalTypeDTO): Promise<MezcalTypeDTO> {
    return this.mezcalTypesService.create(mezcalType);
  }

  /**
   * Api: POST /api/v1/mezcalTypeos/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.mezcalTypesService.paginate(options);
  }
}
