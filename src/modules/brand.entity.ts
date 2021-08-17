import { HouseEntity } from '@mezcal/modules/house.entity';
import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { BrandCommentsEntity } from './browser/brands/brandComments.entity';

/**
 * @ignore
 */
@Entity('brands')
export class BrandEntity extends CommonEntity {
  @Column({
    name: 'rating',
    unique: false,
    type: 'float',
    nullable: true,
  })
  rating?: number;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
    unique: false,
    type: 'text',
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'html',
    type: 'text',
    nullable: true,
  })
  html: string;

  @Column({
    name: 'likes',
    type: 'int',
    default: 0,
  })
  likes: number;

  //una marca tiene una casa
  @ManyToOne(() => HouseEntity, (house) => house.brands, { nullable: false })
  house: HouseEntity;

  @Column({ type: 'int', default: 0 })
  houseId?: number;

  //una casa tiene varias marcas.
  @OneToMany(() => ProductEntity, (product) => product.brand)
  products?: ProductEntity[];

  @OneToOne(() => ImageEntity, (image) => image.brandlogo)
  logo: ImageEntity;

  @OneToMany(() => ImageEntity, (image) => image.brand)
  images: ImageEntity[];

  @OneToMany(() => BrandCommentsEntity, (comment) => comment.brand, {
    onDelete: 'CASCADE',
  })
  comments: BrandCommentsEntity[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    html: string,
    active: boolean,
    house: HouseEntity,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
    this.house = house;
    this.html = html;
  }
}
