import { MastersService } from '@mezcal/modules/owner/masters/masters.service';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

/**
 * Navegacion de maestros mezcaleros desde public
 */
@Controller('browse/masters')
export class MastersController {
  /**
   *
   * @ignore
   */
  constructor(private readonly mastersService: MastersService) {}

  /**
   * Obtener un maestro mezcalero
   *
   * @param id id del maestro mezcaler
   */
  @Get('/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.mastersService.getById(id);
  }
}
