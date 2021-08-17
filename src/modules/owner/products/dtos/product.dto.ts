/**
 * @ignore
 */
export class ProductDTO {
  readonly id?: number; //opcional

  uuid?: string; //opcional

  nombre: string;

  descripcion: string;

  html: string;

  active?: boolean;

  brand: number;

  mezcalType: number;

  price: number;

  score?: number;

  rating?: number;

  processes?: number[];

  agaves?: number[];

  flavors?: number[];

  shops?: number[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    html: string,
    active: boolean,
    brand: number,
    mezcalType: number,
    price: number,
    score?: number,
    rating?: number,
    processes?: number[],
    agaves?: number[],
    flavors?: number[],
    shops?: number[],
  ) {
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
    this.brand = brand;
    this.mezcalType = mezcalType;
    this.price = price;
    this.score = score;
    this.rating = rating;
    this.processes = processes;
    this.agaves = agaves;
    this.flavors = flavors;
    this.shops = shops;
    this.html = html;
  }
}
