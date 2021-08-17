import { ApiProperty } from '@nestjs/swagger';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
/**
 * @ignore
 */
export class ProfileDTO {
  @ApiProperty()
  id?: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  rules?: RuleEntity[];
  constructor(id: number, name: string, rules?: RuleEntity[]) {
    this.id = id;
    this.name = name;
    this.rules = rules;
  }
}
