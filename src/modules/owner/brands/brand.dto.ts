import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class BrandDTO {
  @ApiProperty()
  readonly id?: number; //opcional

  @ApiProperty()
  uuid?: string; //opcional

  @ApiProperty()
  nombre?: string;

  @ApiProperty()
  descripcion?: string;

  @ApiProperty()
  html?: string;

  @ApiProperty()
  active?: boolean;

  @ApiProperty()
  house?: number;

  constructor(
    id: number,
    uuid?: string,
    nombre?: string,
    descripcion?: string,
    html?: string,
    active?: boolean,
    house?: number,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
    this.house = house;
    this.html = html;
  }
}
