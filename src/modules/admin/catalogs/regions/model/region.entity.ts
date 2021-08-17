import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
/**
 * @ignore
 */
@Entity('regions')
export class RegionEntity extends CommonEntity {
  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  estado: string;

  @Column({
    name: 'descripcion',
    type: 'text',
  })
  descripcion: string;

  @Column({
    name: 'html',
    type: 'text',
    nullable: true,
  })
  html?: string;

  //a una region le pertenecen varios productos.
  @OneToMany(() => ProductEntity, (product) => product.region, {
    nullable: true,
  })
  products?: ProductEntity[];

  @Column({
    name: 'lat',
    type: 'float',
    default: 0,
  })
  lat?: number;

  @Column({
    name: 'lng',
    type: 'float',
    default: 0,
  })
  lng?: number;

  @Column({
    name: 'altitude',
    type: 'float',
    default: 0,
  })
  altitude?: number;

  @Column({
    //segun el catalogo oficial de estados de la republica: el numero
    name: 'estateNumber',
    type: 'float',
    default: 0,
  })
  estateNumber?: number;

  @OneToMany(() => ImageEntity, (image) => image.region)
  images?: ImageEntity[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    estado: string,
    descripcion: string,
    html: string,
    active: boolean,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.estado = estado;
    this.descripcion = descripcion;
    this.html = html;
    this.active = active;
  }
}
