import { Entity, Column, ManyToMany, ManyToOne } from 'typeorm';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';

/**
 * @ignore
 */
@Entity('shops')
export class ShopEntity extends CommonEntity {
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
  })
  descripcion: string;

  @Column({
    name: 'formattedAddress',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  formattedAddress: string;

  @Column({
    name: 'addressComponents',
    type: 'simple-array',
    nullable: true,
  })
  addressComponents: string[];

  @Column({
    name: 'url',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  url: string;

  @Column({
    name: 'placeId',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  placeId: string;

  @ManyToMany(() => ProductEntity, (product) => product.shops)
  products: ProductEntity[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    active: boolean,
    formattedAddress?: string,
    addressComponents?: string[],
    url?: string,
    placeId?: string,
    products?: ProductEntity[],
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
    this.formattedAddress = formattedAddress;
    this.addressComponents = addressComponents;
    this.url = url;
    this.placeId = placeId;
    this.products = products;
  }
}
