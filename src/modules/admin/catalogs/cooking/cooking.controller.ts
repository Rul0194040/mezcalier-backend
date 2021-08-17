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
import { CookingService } from './cooking.service';
import { CookingDTO } from './cooking.dto';
import { UpdateResult, DeleteResult } from 'typeorm';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { CookingEntity } from './cooking.entity';
import { UserEntity } from '../../users/model/user.entity';
import { User } from '../../users/user.decorator';

@Controller('admin/catalogs/cookings')
@ApiBearerAuth()
@ApiTags('cookings')
@Profiles(ProfileTypes.ADMIN)
@UseGuards(JwtAuthGuard, RulesGuard)
export class CookingController {
  //TODO: CRUD methods
  /**
   * Servicios utilizados
   * @param cookingsService
   * @param logger
   */
  constructor(private readonly cookingsService: CookingService) {}

  @Put(':id/status')
  changeCookingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active', ParseBoolPipe) status: boolean,
  ): Promise<UpdateResult> {
    return this.cookingsService.updateStatus(id, status);
  }

  /**
   * Api: GET /api/v1/cookings/:id
   *
   * @param {number} id el id del cooking a actualizar
   * @returns {CookingDTO} - el cooking de la base de datos
   */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<CookingEntity> {
    return this.cookingsService.getCookingById(id);
  }

  /**
   * Api: PUT /api/v1/cookings/:id
   *
   * @param {number} id el id del cooking a actualizar
   * @param {CookingDTO} cooking los cambios al cooking
   * @returns {CookingDTO} - el cooking de la base de datos
   */
  @Put(':id')
  updateCooking(
    @Param('id') id: number,
    @Body() cooking: CookingDTO,
  ): Promise<UpdateResult> {
    return this.cookingsService.update(id, cooking);
  }

  /**
   * Elimina un cooking de la base de datos
   *
   * Otra linea.
   *
   * @param {number} id el cooking a borrar
   * @returns {DeleteResult} result del borrado.
   */
  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.cookingsService.delete(id);
  }

  /**
   * Api: GET /api/v1/cookings
   *
   * @returns {CookingDTO[]} cookings
   */
  @Get()
  get(@User() user: UserEntity): Promise<CookingEntity[]> {
    return this.cookingsService.get(user);
  }

  /**
   * Api: POST /api/v1/cookings
   *
   * @param {CookingDTO} cooking cooking a crear.
   * @returns {CookingDTO} cooking
   */
  @Post()
  post(@Body() cooking: CookingDTO): Promise<CookingEntity> {
    return this.cookingsService.create(cooking);
  }

  /**
   * Api: POST /api/v1/cookings/paginate
   *
   * @param {PaginationPrimeNG} options
   * @returns {PaginationPrimeNgResult} la salida
   */
  @Post('paginate')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this.cookingsService.paginate(options);
  }
}
