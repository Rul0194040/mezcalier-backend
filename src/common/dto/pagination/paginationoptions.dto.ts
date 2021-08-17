import { ApiProperty } from '@nestjs/swagger';
import { PaginationSortsDTO } from '@mezcal/common/dto/pagination/paginationsorts.dto';
import { PaginationFiltersDTO } from '@mezcal/common/dto/pagination/paginationfilters.dto';
/**
 * @ignore
 */
export class PaginationOptionsDTO {
  @ApiProperty()
  pageSize: number;
  @ApiProperty()
  pageNumber: number;
  @ApiProperty()
  filters: PaginationFiltersDTO[];
  @ApiProperty()
  sorts: PaginationSortsDTO[];
}
