import { ApiProperty } from '@nestjs/swagger';
/**
 * Documento de casa
 */
export class HouseDTO {
  /**
   * Id de la casa
   */
  @ApiProperty()
  readonly id?: number;
  /**
   * uuid de la casa
   */
  @ApiProperty()
  uuid?: string;
  /**
   * email de la casa
   */
  @ApiProperty()
  email: string;

  /**
   * Descripcion de la casa
   */
  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  html: string;

  /**
   * nombre a usar para la casa
   */
  @ApiProperty()
  nombre: string;

  /**
   * direccion de la casa
   */
  @ApiProperty()
  calle: string;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  numExt?: string;

  @ApiProperty()
  numInt?: string;

  @ApiProperty()
  colonia?: string;

  @ApiProperty()
  municipio?: string;

  @ApiProperty()
  localidad?: string;

  @ApiProperty()
  active?: boolean;

  constructor(
    id: number,
    uuid: string,
    email: string,
    nombre: string,
    descripcion: string,
    html: string,
    active: boolean,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.email = email;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
    this.html = html;
  }
}
