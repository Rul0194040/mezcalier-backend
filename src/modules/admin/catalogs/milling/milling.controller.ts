import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { Profiles } from '@mezcal/common/decorators/profiles.decorator';
import {
  Controller,
  UseGuards,
  Put,
  Param,
  ParseIntPipe,
  Body,
  ParseBoolPipe,
  Get,
  Delete,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProfileTypes } from '../../profiles/model/profiles.enum';
import { UpdateResult, DeleteResult } from 'typeorm';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { MillingService } from './milling.service';
import { MillingEntity } from './milling.entity';
import { MillingDTO } from './milling.dto';
import { User } from '../../users/user.decorator';
import { UserEntity } from '../../users/model/user.entity';

@Controller('admin/catalogs/millings')
@ApiBearerAuth()
@ApiTags('millings')
@Profiles(ProfileTypes.ADMIN)
@UseGuards(JwtAuthGuard, RulesGuard)
export class MillingController {
  /**
   * Servicios utilizados
   * @param millingsService
   * @param logger
   */
  constructor(private readonly millingsService: MillingService) {}

  @Put(':id/status')
  changeMillingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) status: boolean,
  ): Promise<UpdateResult> {
    return this.millingsService.updateStatus(id, status);
  }

  /**
   * Api: GET /api/v1/millings/:id
   *
   * @param {number} id el id del milling a actualizar
   * @returns {MillingDTO} - el milling de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<MillingEntity> {
    return this.millingsService.getMillingById(id);
  }

  /**
   * Api: PUT /api/v1/millings/:id
   *
   * @param {number} id el id del milling a actualizar
   * @param {MillingDTO} milling los cambios al milling
   * @returns {MillingDTO} - el milling de la base de datos
   */
  @Put(':id')
  updateMilling(
    @Param('id') id: number,
    @Body() milling: MillingDTO,
  ): Promise<UpdateResult> {
    return this.millingsService.update(id, milling);
  }

  /**
   * Elimina un milling de la base de datos
   *
   * Otra linea.
   *
   * @param {number} id el milling a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.millingsService.delete(id);
  }

  /**
   * Api: GET /api/v1/millings
   *
   * @returns {MillingDTO[]} millings
   */
  @Get()
  get(@User() user: UserEntity): Promise<MillingEntity[]> {
    return this.millingsService.get(user);
  }

  /**
   * Api: POST /api/v1/millings
   *
   * @param {MillingDTO} milling milling a crear.
   * @returns {MillingDTO} milling
   */
  @Post()
  post(@Body() milling: MillingDTO): Promise<MillingEntity> {
    return this.millingsService.create(milling);
  }

  /**
   * Api: POST /api/v1/millings/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.millingsService.paginate(options);
  }
}
