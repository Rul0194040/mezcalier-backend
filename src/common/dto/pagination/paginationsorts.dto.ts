import { ApiProperty } from '@nestjs/swagger';
import { DBOrders } from '@mezcal/common/enum/dborders.enum';
/**
 * @ignore
 */
export class PaginationSortsDTO {
  @ApiProperty()
  priority: number;
  @ApiProperty()
  field: string;
  @ApiProperty()
  order: DBOrders; //ASC, DESC
}
