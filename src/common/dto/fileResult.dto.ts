import { ApiProperty } from '@nestjs/swagger';
/**
 * Esto regresa el api al subir un archivo.
 */
export class FileResultDTO {
  /**
   * @ignore
   */
  @ApiProperty()
  fieldname: string;
  /**
   * @ignore
   */
  @ApiProperty()
  originalname: string;
  /**
   * @ignore
   */
  @ApiProperty()
  encoding: string;
  /**
   * @ignore
   */
  @ApiProperty()
  mimetype: string;
  /**
   * @ignore
   */
  @ApiProperty()
  destination: string;
  /**
   * @ignore
   */
  @ApiProperty()
  filename: string;
  /**
   * @ignore
   */
  @ApiProperty()
  path: string;
  /**
   * @ignore
   */
  @ApiProperty()
  size: number;
}
