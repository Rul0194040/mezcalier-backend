import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class LimitesHouseDTO {
  @ApiProperty()
  brands: number;

  @ApiProperty()
  products: number;
}
