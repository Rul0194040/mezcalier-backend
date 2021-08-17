import { ApiProperty } from '@nestjs/swagger';
import { PaginationFiltersFilterDTO } from '@mezcal/common/dto/pagination/paginationfiltersfilter.dto';
/**
 * @ignore
 */
export class PaginationFiltersDTO {
  @ApiProperty()
  field: string;
  @ApiProperty()
  filters: PaginationFiltersFilterDTO[];
}
