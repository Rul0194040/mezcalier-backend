import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class DistillingDTO {
  @ApiProperty()
  readonly id?: number; //opcional

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  constructor(id: number, nombre: string, descripcion: string) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }
}
