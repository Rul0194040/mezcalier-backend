import { Entity, Column, ManyToMany } from 'typeorm';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';

/**
 * @ignore
 */
@Entity('flavors')
export class FlavorEntity extends CommonEntity {
  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'html',
    type: 'text',
    nullable: true,
  })
  html?: string;

  @ManyToMany(() => ProductEntity, (product) => product.flavors)
  products?: ProductEntity[];

  @ManyToMany(() => ProductEntity, (product) => product.aromas)
  productsAromas?: ProductEntity[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    html: string,
    active: boolean,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.html = html;
    this.active = active;
  }
}
