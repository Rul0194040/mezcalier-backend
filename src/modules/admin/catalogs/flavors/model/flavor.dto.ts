import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class FlavorDTO {
  @ApiProperty()
  readonly id?: number; //opcional

  @ApiProperty()
  uuid?: string; //opcional

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  html: string;

  @ApiProperty()
  active?: boolean;

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    html: string,
    active: boolean,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.html = html;
    this.active = active;
  }
}
