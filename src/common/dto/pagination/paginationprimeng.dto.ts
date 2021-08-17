/**
 * PaginationPrimeNG
 */
export class PaginationPrimeNG {
  /**
   * @ignore
   */
  sort: any;
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
  filters: any;
}

/**
 * PaginationPrimeNgResult
 */
export class PaginationPrimeNgResult {
  /**
   * @ignore
   */
  data: any[];
  /**
   * @ignore
   */
  skip: number;
  /**
   * @ignore
   */
  totalItems: number;
}
/**
 * PaginationPrimeNgQuery
 */
export class PaginationPrimeNgQuery {
  /**
   * @ignore
   */
  relations?: string[];
  /**
   * @ignore
   */
  where: any[];
  /**
   * @ignore
   */
  order: any;
  /**
   * @ignore
   */
  skip: any;
  /**
   * @ignore
   */
  take: any;
}
