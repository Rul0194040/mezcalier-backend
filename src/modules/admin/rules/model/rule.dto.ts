import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class RuleDTO {
  @ApiProperty()
  readonly id?: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  value: string;

  constructor(id: number, name: string, description: string, value: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.value = value;
  }
}
