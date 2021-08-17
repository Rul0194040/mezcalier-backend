import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';

/**
 * @ignore
 */
@Entity('masters')
export class MasterEntity extends CommonEntity {
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

  //un maestro tiene una casa
  @ManyToOne(() => HouseEntity, (house) => house.masters, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  house: HouseEntity;

  //un maestro tien muchos productos
  @OneToMany(() => ProductEntity, (product) => product.master, {
    nullable: true,
  })
  products: ProductEntity[];

  @OneToMany(() => ImageEntity, (image) => image.master)
  images: ImageEntity[];

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
