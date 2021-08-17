import {
  Controller,
  Get,
  UseGuards,
  Param,
  Post,
  Put,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';

import { ProfileDTO } from '@mezcal/modules/admin/profiles/model/profile.dto';
import { ProfilesService } from '@mezcal/modules/admin/profiles/profiles.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
/**
 * Controller de profiles
 */
@ApiBearerAuth()
@ApiTags('profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard, RulesGuard)
export class ProfilesController {
  /**
   * @ignore
   */
  constructor(private readonly _profilesService: ProfilesService) {}

  /**
   * Obtener todos los perfiles
   */
  @Get('')
  @Rules('view:profiles')
  get(): Promise<ProfileDTO[]> {
    return this._profilesService.get();
  }

  /**
   * Obtener por id
   * @param id
   */
  @Get(':id')
  @Rules('view:profiles')
  getById(@Param('id', ParseIntPipe) id: number): Promise<ProfileDTO> {
    return this._profilesService.getById(id);
  }

  /**
   * Creacion de perfiles
   * @param user
   */
  @Post()
  @Rules('create:profiles')
  create(@Body() user: ProfileDTO): Promise<ProfileDTO> {
    return this._profilesService.create(user);
  }

  @Put(':id')
  @Rules('update:profiles')
  update(
    @Param('id') id: number,
    @Body() user: ProfileDTO,
  ): Promise<ProfileDTO> {
    return this._profilesService.update(id, user);
  }

  /**
   * Paginacion de registros
   * @param options
   */
  @Post('getall')
  @Rules('view:profiles')
  paginate(
    @Body() options: PaginationPrimeNG,
  ): Promise<PaginationPrimeNgResult> {
    return this._profilesService.paginate(options);
  }
}
