import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { RulesController } from '@mezcal/modules/admin/rules/rules.controller';
import { RulesService } from '@mezcal/modules/admin/rules/rules.service';
import { MyLogger } from '@mezcal/common/services/logger.service';
/**
 * Rules module
 */
@Module({
  imports: [TypeOrmModule.forFeature([RuleEntity])],
  controllers: [RulesController],
  providers: [RulesService, MyLogger],
  exports: [RulesService],
})
export class RulesModule {}
