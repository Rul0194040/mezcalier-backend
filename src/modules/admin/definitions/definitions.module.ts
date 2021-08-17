import { Module } from '@nestjs/common';
import { DefinitionsController } from '@mezcal/modules/admin/definitions/definitions.controller';
import { DefinitionsService } from '@mezcal/modules/admin/definitions/definitions.service';
/**
 * Módulo de definiciones
 */
@Module({
  controllers: [DefinitionsController],
  providers: [DefinitionsService],
})
export class DefinitionsModule {}
