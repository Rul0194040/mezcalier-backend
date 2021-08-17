import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class RegionDTO {
  @ApiProperty()
  readonly id?: number; //opcional

  @ApiProperty()
  uuid?: string; //opcional

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  html: string;

  @ApiProperty()
  active?: boolean;

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    estado: string,
    descripcion: string,
    html: string,
    active: boolean,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.estado = estado;
    this.descripcion = descripcion;
    this.html = html;
    this.active = active;
  }
}
