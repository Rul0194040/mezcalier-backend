import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ProductEntity } from '@mezcal/modules/product.entity';

/**
 * @ignore
 */
@Entity('mezcalTypes')
export class MezcalTypeEntity extends CommonEntity {
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

  //a un tipo de mezcal le pertenecen varios productos.
  @OneToMany(() => ProductEntity, (product) => product.mezcalType)
  products?: ProductEntity[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    active: boolean,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
  }
}
