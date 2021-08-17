/**
 * Se utiliza para input/output
 *
 * comment: input
 *
 * affected: output
 */
export class HouseCommentDTO {
  /**
   * El comentario en cadea, requerido en input
   */
  comment: string;
  /**
   * El numero de registros afectados, se utiliza cuando este dto se retorna en el delete
   */
  affected?: number;
}
