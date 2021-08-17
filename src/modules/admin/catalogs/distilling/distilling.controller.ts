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
import { DistillingService } from './distilling.service';
import { DistillingEntity } from './distilling.entity';
import { DistillingDTO } from './distilling.dto';
import { UserEntity } from '../../users/model/user.entity';
import { User } from '../../users/user.decorator';

@Controller('admin/catalogs/distillings')
@ApiBearerAuth()
@ApiTags('distillings')
@Profiles(ProfileTypes.ADMIN)
@UseGuards(JwtAuthGuard, RulesGuard)
export class DistillingController {
  //TODO: CRUD methods
  /**
   * Servicios utilizados
   * @param distillingsService
   * @param logger
   */
  constructor(private readonly distillingsService: DistillingService) {}

  @Put(':id/status')
  changeDistillingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) status: boolean,
  ): Promise<UpdateResult> {
    return this.distillingsService.updateStatus(id, status);
  }

  /**
   * Api: GET /api/v1/distillings/:id
   *
   * @param {number} id el id del distilling a actualizar
   * @returns {DistillingDTO} - el distilling de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<DistillingEntity> {
    return this.distillingsService.getDistillingById(id);
  }

  /**
   * Api: PUT /api/v1/distillings/:id
   *
   * @param {number} id el id del distilling a actualizar
   * @param {DistillingDTO} distilling los cambios al distilling
   * @returns {DistillingDTO} - el distilling de la base de datos
   */
  @Put(':id')
  updateDistilling(
    @Param('id') id: number,
    @Body() distilling: DistillingDTO,
  ): Promise<UpdateResult> {
    return this.distillingsService.update(id, distilling);
  }

  /**
   * Elimina un distilling de la base de datos
   *
   * Otra linea.
   *
   * @param {number} id el distilling a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.distillingsService.delete(id);
  }

  /**
   * Api: GET /api/v1/distillings
   *
   * @returns {DistillingDTO[]} distillings
   */
  @Get()
  get(@User() user: UserEntity): Promise<DistillingEntity[]> {
    return this.distillingsService.get(user);
  }

  /**
   * Api: POST /api/v1/distillings
   *
   * @param {DistillingDTO} distilling distilling a crear.
   * @returns {DistillingDTO} distilling
   */
  @Post()
  post(@Body() distilling: DistillingDTO): Promise<DistillingEntity> {
    return this.distillingsService.create(distilling);
  }

  /**
   * Api: POST /api/v1/distillings/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.distillingsService.paginate(options);
  }
}
