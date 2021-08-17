import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
// 2: {field: "l.userAgent", filters: [{term:'string'}]}
export class PaginationFiltersFilterDTO {
  @ApiProperty()
  term: string;
}
