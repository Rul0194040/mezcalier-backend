import { Controller, Post, Body } from '@nestjs/common';
import { CreateDefDTO } from '@mezcal/modules/admin/definitions/dto/create-def.dto';
import { DefinitionsService } from '@mezcal/modules/admin/definitions/definitions.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DefinitionsEntity } from '@mezcal/modules/admin/definitions/definitions.entity';
/**
 * Controller para definiciones
 */
@ApiBearerAuth()
@ApiTags('Definitions')
@Controller('definitions')
export class DefinitionsController {
  /**
   * @ignore
   */
  constructor(private readonly definitionsService: DefinitionsService) {}
  /**
   * Crear definiciones
   * @param createDefDto objeto de definicion
   */
  @Post()
  async newDefinition(
    @Body() createDefDto: CreateDefDTO,
  ): Promise<DefinitionsEntity> {
    return this.definitionsService.create(createDefDto);
  }
}
