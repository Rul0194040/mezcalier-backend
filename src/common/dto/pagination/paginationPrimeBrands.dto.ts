import { BrandsSortTypes } from '../../enum/brandsSortTypes.enum';

/**
 * PaginationPrimeNG
 */
export class PaginationPrimeNgBrands {
  /**
   * @ignore
   */
  sort?: BrandsSortTypes;
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
  };
}
