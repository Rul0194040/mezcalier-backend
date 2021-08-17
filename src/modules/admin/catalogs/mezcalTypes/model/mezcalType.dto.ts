import { ApiProperty } from '@nestjs/swagger';

/**
 * @ignore
 */
export class MezcalTypeDTO {
  @ApiProperty()
  readonly id?: number; //opcional

  @ApiProperty()
  uuid?: string; //opcional

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  active?: boolean;

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    active: boolean,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
  }
}
