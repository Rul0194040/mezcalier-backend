import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class ShopDTO {
  @ApiProperty()
  readonly id?: number; //opcional

  @ApiProperty()
  uuid?: string; //opcional

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  formattedAddress?: string;

  @ApiProperty()
  addressComponents?: string[];

  @ApiProperty()
  url?: string;

  @ApiProperty()
  placeId?: string;

  @ApiProperty()
  active?: boolean;

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    active: boolean,
    formattedAddress: string,
    addressComponents: string[],
    url: string,
    placeId?: string,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
    this.formattedAddress = formattedAddress;
    this.addressComponents = addressComponents;
    this.url = url;
    this.placeId = placeId;
  }
}
