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
import { FermentingService } from './fermenting.service';
import { FermentingEntity } from './fermenting.entity';
import { FermentingDTO } from './fermenting.dto';
import { User } from '../../users/user.decorator';
import { UserEntity } from '../../users/model/user.entity';
@Controller('admin/catalogs/fermentings')
@ApiBearerAuth()
@ApiTags('fermentings')
@Profiles(ProfileTypes.ADMIN)
@UseGuards(JwtAuthGuard, RulesGuard)
export class FermentingController {
  //TODO: CRUD methods
  /**
   * Servicios utilizados
   * @param fermentingsService
   * @param logger
   */
  constructor(private readonly fermentingsService: FermentingService) {}

  @Put(':id/status')
  changeFermentingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) status: boolean,
  ): Promise<UpdateResult> {
    return this.fermentingsService.updateStatus(id, status);
  }

  /**
   * Api: GET /api/v1/fermentings/:id
   *
   * @param {number} id el id del fermenting a actualizar
   * @returns {FermentingDTO} - el fermenting de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<FermentingEntity> {
    return this.fermentingsService.getFermentingById(id);
  }

  /**
   * Api: PUT /api/v1/fermentings/:id
   *
   * @param {number} id el id del fermenting a actualizar
   * @param {FermentingDTO} fermenting los cambios al fermenting
   * @returns {FermentingDTO} - el fermenting de la base de datos
   */
  @Put(':id')
  updateFermenting(
    @Param('id') id: number,
    @Body() fermenting: FermentingDTO,
  ): Promise<UpdateResult> {
    return this.fermentingsService.update(id, fermenting);
  }

  /**
   * Elimina un fermenting de la base de datos
   *
   * Otra linea.
   *
   * @param {number} id el fermenting a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.fermentingsService.delete(id);
  }

  /**
   * Api: GET /api/v1/fermentings
   *
   * @returns {FermentingDTO[]} fermentings
   */
  @Get()
  get(@User() user: UserEntity): Promise<FermentingEntity[]> {
    return this.fermentingsService.get(user);
  }

  /**
   * Api: POST /api/v1/fermentings
   *
   * @param {FermentingDTO} fermenting fermenting a crear.
   * @returns {FermentingDTO} fermenting
   */
  @Post()
  post(@Body() fermenting: FermentingDTO): Promise<FermentingEntity> {
    return this.fermentingsService.create(fermenting);
  }

  /**
   * Api: POST /api/v1/fermentings/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.fermentingsService.paginate(options);
  }
}
