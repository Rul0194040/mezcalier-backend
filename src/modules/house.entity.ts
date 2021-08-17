import { Entity, Column, OneToMany } from 'typeorm';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { HouseCommentsEntity } from './browser/houses/models/houseComments.entity';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { MasterEntity } from './owner/masters/model/master.entity';

/**
 * @ignore
 */
@Entity('houses')
export class HouseEntity extends CommonEntity {
  @Column({
    name: 'rating',
    unique: false,
    type: 'float',
    nullable: true,
  })
  rating?: number;

  @Column({
    name: 'limiteBrands',
    type: 'int',
    default: 0,
  })
  limiteBrands: number;

  @Column({
    name: 'limiteProducts',
    type: 'int',
    default: 0,
  })
  limiteProducts: number;

  @Column({
    name: 'email',
    unique: true,
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
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
    name: 'calle',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  calle: string;

  @Column({
    name: 'numExt',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  numExt: string;

  @Column({
    name: 'numInt',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  numInt: string;

  @Column({
    name: 'colonia',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  colonia: string;

  @Column({
    name: 'municipio',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  municipio: string;

  @Column({
    name: 'localidad',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  localidad: string;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  estado: string;

  @Column({
    name: 'likes',
    type: 'int',
    default: 0,
  })
  likes: string;

  @OneToMany(() => UserEntity, (user) => user.house)
  users: UserEntity[];

  //una casa tiene varias marcas.
  @OneToMany(() => BrandEntity, (brand) => brand.house)
  brands: BrandEntity[];

  //una casa tiene varios maestros.
  @OneToMany(() => MasterEntity, (master) => master.house)
  masters: MasterEntity[];

  @OneToMany(() => ImageEntity, (image) => image.house)
  images: ImageEntity[];

  @OneToMany(() => HouseCommentsEntity, (comment) => comment.house, {
    onDelete: 'CASCADE',
  })
  comments: HouseCommentsEntity[];

  constructor(
    id: number,
    uuid: string,
    email: string,
    descripcion: string,
    html: string,
    nombre: string,
    calle: string,
    estado: string,
    numExt?: string,
    numInt?: string,
    colonia?: string,
    municipio?: string,
    localidad?: string,
    active?: boolean,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.email = email;
    this.descripcion = descripcion;
    this.nombre = nombre;
    this.calle = calle;
    this.estado = estado;
    this.numExt = numExt;
    this.numInt = numInt;
    this.colonia = colonia;
    this.municipio = municipio;
    this.localidad = localidad;
    this.active = active;
    this.html = html;
  }
}
