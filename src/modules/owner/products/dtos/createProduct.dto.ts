/**
 * @ignore
 */
export class createProductDTO {
  nombre: string;

  descripcion: string;

  html: string;

  brand: number;

  region: number;

  mezcalType: number;

  price?: number;

  active?: boolean;

  constructor(
    nombre: string,
    descripcion: string,
    html: string,
    brand: number,
    region: number,
    mezcalType: number,
    price?: number,
    active?: boolean,
  ) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.brand = brand;
    this.region = region;
    this.mezcalType = mezcalType;
    this.price = price;
    this.active = active;
    this.html = html;
  }
}
