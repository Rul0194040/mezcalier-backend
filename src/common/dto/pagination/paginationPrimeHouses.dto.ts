import { HousesSortTypes } from '../../enum/housesSortTypes.enum';

/**
 * PaginationPrimeNG
 */
export class PaginationPrimeNgHouses {
  /**
   * @ignore
   */
  sort?: HousesSortTypes;
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
