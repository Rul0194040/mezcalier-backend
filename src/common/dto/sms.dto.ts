import { ApiProperty } from '@nestjs/swagger';
/**
 * DTO para la entrada POST SMS
 * falta validar num y mensaje
 */
export class SmsDTO {
  /**
   * @ignore
   */
  @ApiProperty()
  message: string;
  /**
   * @ignore
   */
  @ApiProperty()
  num: string;
}
