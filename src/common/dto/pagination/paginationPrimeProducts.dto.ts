import { SortTypes } from '@mezcal/common/enum/sortTypes.enum';

/**
 * PaginationPrimeNG
 */
export class PaginationPrimeNgProducts {
  /**
   * @ignore
   */
  sort?: SortTypes;
  /**
   * @ignore
   */
  skip: number;
  /**
   * @ignore
   */
  take: number;
  /**
   * @ignore
   */
  filters: {
    search?: string;
    agave?: number;
    brand?: number;
    region?: number;
    house?: number;
    master?: number;
    mezcalType?: number;
    process?: number;
    flavor?: number;
    shop?: number;
    price?: {
      from: number;
      to: number;
    };
    rating?: {
      from: number;
      to: number;
    };
  };
}
