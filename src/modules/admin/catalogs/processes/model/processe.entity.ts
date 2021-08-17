import { Entity, Column, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { CookingEntity } from '../../cooking/cooking.entity';
import { DistillingEntity } from '../../distilling/distilling.entity';
import { FermentingEntity } from '../../fermenting/fermenting.entity';
import { MillingEntity } from '../../milling/milling.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';

/**
 * @ignore
 */
@Entity('processes')
export class ProcesseEntity extends CommonEntity {
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
    name: 'html',
    type: 'text',
    nullable: true,
  })
  html?: string;

  //con un o varios procesos se generan uno o varios mezcales
  @ManyToMany(() => ProductEntity, (product) => product.processes)
  products?: ProductEntity[];

  //los procesos tienen varias cocciones
  @ManyToMany(() => CookingEntity, (cooking) => cooking.processes, {
    nullable: true,
  })
  @JoinTable()
  cookings?: CookingEntity;

  //los procesos tienen varias moliendas
  @ManyToMany(() => MillingEntity, (cooking) => cooking.processes, {
    nullable: true,
  })
  @JoinTable()
  millings?: MillingEntity;

  @ManyToMany(() => FermentingEntity, (cooking) => cooking.processes, {
    nullable: true,
  })
  @JoinTable()
  fermentings?: FermentingEntity;

  @ManyToMany(() => DistillingEntity, (cooking) => cooking.processes, {
    nullable: true,
  })
  @JoinTable()
  distillings?: DistillingEntity;

  @OneToMany(() => ImageEntity, (image) => image.processe)
  images?: ImageEntity[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    html: string,
    active: boolean,
    products?: ProductEntity[],
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.html = html;
    this.active = active;
    this.products = products;
  }
}
