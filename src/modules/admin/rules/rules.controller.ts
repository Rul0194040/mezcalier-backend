import {
  Controller,
  Get,
  UseGuards,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RulesService } from '@mezcal/modules/admin/rules/rules.service';
import { Rules } from '@mezcal/common/decorators/rules.decorator';
import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { RuleDTO } from '@mezcal/modules/admin/rules/model/rule.dto';
import { RulesGuard } from '@mezcal/auth/guards/rules/rules.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
/**
 * Rules controller
 */
@ApiBearerAuth()
@ApiTags('rules')
@Controller('rules')
@UseGuards(JwtAuthGuard, RulesGuard)
export class RulesController {
  /**
   * @ignore
   */
  constructor(private readonly _rulesService: RulesService) {}
  /**
   * Listado de reglas
   */

  @Get('')
  @Rules('view:rules')
  getAllRules(): Promise<RuleDTO[]> {
    return this._rulesService.getAllRules();
  }
  /**
   * Obtener reglas por id
   *
   * @param id id de la regla
   */

  @Get(':id')
  @Rules('view:rules')
  getRule(@Param('id', ParseIntPipe) id: number): Promise<RuleDTO> {
    return this._rulesService.getRuleById(id);
  }
  /**
   * Creacion de reglas
   *
   * @param rule objeto de regla
   */
  @Post()
  @Rules('create:rules')
  newRule(@Body() rule: RuleDTO): Promise<RuleDTO> {
    return this._rulesService.create(rule);
  }
  /**
   * Actualizar una regla
   *
   * @param id id de la regla a actualizar
   * @param rule objeto de la regla a actualizar
   */
  @Put(':id')
  @Rules('update:rules')
  updateRule(
    @Param('id') id: number,
    @Body() rule: RuleDTO,
  ): Promise<UpdateResult> {
    return this._rulesService.update(id, rule);
  }
  /**
   * Eliminar reglas
   *
   * @param id id de la regla a eliminar
   */
  @Delete(':id')
  @Rules('delete:rules')
  deleteRule(@Param('id') id: number): Promise<DeleteResult> {
    return this._rulesService.deleteRule(id);
  }

  /**
   * Paginacion de reglas
   *
   * @param options Opciones de paginacion
   */
  @Post('getall')
  @Rules('view:rules')
  getAll(@Body() options: PaginationPrimeNG): Promise<PaginationPrimeNgResult> {
    return this._rulesService.getAll(options);
  }
}
