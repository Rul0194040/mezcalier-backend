/**
 * @ignore
 */
export class UpdateProductDTO {
  nombre?: string;

  descripcion?: string;

  html?: string;

  brand?: number;

  region?: number;

  mezcalType?: number;

  price?: number;

  score?: number;

  rating?: number;

  colorAspect?: string;

  agingMaterial?: string;

  agingTime?: number;

  alcoholVolume?: number;

  distillingsNumber?: number;

  ltProduced?: number;

  constructor(
    nombre?: string,
    descripcion?: string,
    html?: string,
    brand?: number,
    region?: number,
    mezcalType?: number,
    price?: number,
    score?: number,
    rating?: number,
    colorAspect?: string,
    agingMaterial?: string,
    agingTime?: number,
    alcoholVolume?: number,
    distillingsNumber?: number,
    ltProduced?: number,
  ) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.brand = brand;
    this.region = region;
    this.mezcalType = mezcalType;
    this.price = price;
    this.score = score;
    this.rating = rating;
    this.colorAspect = colorAspect;
    this.agingMaterial = agingMaterial;
    this.agingTime = agingTime;
    this.alcoholVolume = alcoholVolume;
    this.distillingsNumber = distillingsNumber;
    this.ltProduced = ltProduced;
    this.html = html;
  }
}
