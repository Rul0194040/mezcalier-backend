import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class createBrandDTO {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  html: string;

  //@ApiProperty()
  //house?: number;

  constructor(nombre: string, descripcion: string) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    //this.house = house;
  }
}
