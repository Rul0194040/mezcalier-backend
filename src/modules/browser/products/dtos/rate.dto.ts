/**
 * Se utiliza este mismo DTO para el retorno que es donde va affected y newRating
 */
export class RateDTO {
  /**
   * El rating cuando se usa para enviar
   */
  rating: number;
  /**
   * Los registros afectados cuando se hace un rating
   */
  affected?: number;
  /**
   * El nuevo rating del producto despues de la operacion
   */
  newRating?: number;
}
