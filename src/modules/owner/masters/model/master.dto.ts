import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class MasterDTO {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  html: string;

  @ApiProperty()
  active?: boolean;

  constructor(
    nombre: string,
    descripcion: string,
    html: string,
    active: boolean,
  ) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.html = html;
    this.active = active;
    this.html = html;
  }
}
