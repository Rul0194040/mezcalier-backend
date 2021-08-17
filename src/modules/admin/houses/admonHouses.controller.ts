import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { HousesService } from '@mezcal/modules/owner/houses/houses.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ProfileTypes } from '../profiles/model/profiles.enum';
import { LimitesHouseDTO } from './limitesHouse.dto';
import { ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/model/user.entity';

@Controller('admin/houses')
@Profiles(ProfileTypes.ADMIN)
export class AdminHousesController {
  /**
   * Servicios utilizados
   * @param housesService
   * @param logger
   */
  constructor(
    private readonly housesService: HousesService,
    private readonly userService: UsersService,
  ) {}

  /**
   * Obtener una casa
   *
   * @param id id de la casa
   */

  /**
   * Obtener una casa
   *
   * @param id id de la casa a borrar
   * @returns regresa una entidad de casa mezcalera
   */
  @Rules('view:houses')
  @Get(':id')
  getHouse(@Param('id') id: number): Promise<HouseEntity> {
    return this.housesService.getById(id);
  }

  /**
   * Obtener los usuarios de una casa
   *
   * @param id id de la casa a borrar
   * @returns regresa una entidad de casa mezcalera
   */
  @Rules('view:houses')
  @Get(':id/users')
  getHouseUsers(@Param('id') id: number): Promise<UserEntity[]> {
    return this.userService.getByHouseId(id);
  }

  /**
   * Borrar una casa
   *
   * @param id id de la casa a borrar
   */
  @Rules('delete:houses')
  @Delete(':id')
  deleteHouse(@Param('id') id: number): Promise<DeleteResult> {
    //TODOS: este metodo tambien deberia de borrar el/los usuarios de la casa
    return this.housesService.delete(id);
  }

  /**
   * Paginar las casas
   *
   * @param options opciones de paginacion
   */
  @Rules('view:houses')
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.housesService.paginate(options);
  }

  @ApiOperation({
    summary: 'Autorizar la casa, activa la casa y al usuario relacionado.',
  })
  @Put(':id/authorize')
  authorize(
    @Param('id') id: number,
    @Body() limites: LimitesHouseDTO,
  ): Promise<UpdateResult> {
    return this.housesService.authorize(id, limites);
  }

  /**
   * Cambia el estado de una casa y sus usuario a activo o inactivo
   * @param id id de la casa a desactivar
   * @param active true / false
   */
  @ApiOperation({
    summary: 'Actualizar el estado de una casa y los usuarios de esa casa',
  })
  @Rules('update:houses')
  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) active: boolean,
  ): Promise<{ updatedHouse: UpdateResult; updatedUsers: UpdateResult }> {
    const updatedHouse = await this.housesService.updateStatus(id, active);
    const updatedUsers = await this.userService.updateStatusByHouse(id, active);
    return { updatedHouse, updatedUsers };
  }

  /**
   * Valida si ya ha sido registrado el email en una casa
   *
   * @param email email de la casa a validar
   * @returns { ok: boolean; message: string } false si el correo ya ha sido registrado, true si esta disponible
   */
  @Post('validate')
  async validarCasa(
    @Body('email') email: string,
  ): Promise<{ ok: boolean; message: string }> {
    return this.housesService.verificateHouse(email);
  }
}
