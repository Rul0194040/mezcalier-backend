import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
/**
 * @ignore
 */
@Entity('agaves')
export class AgaveEntity extends CommonEntity {
  @Column({
    name: 'nombre',
    type: 'text',
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
    type: 'text',
  })
  descripcion: string;

  @Column({
    name: 'nombreCientifico',
    type: 'text',
    nullable: true,
  })
  nombreCientifico?: string;

  @Column({
    name: 'nombresConocidos',
    type: 'json',
    nullable: true,
  })
  nombresConocidos?: string[];

  @Column({
    name: 'distribucion',
    type: 'text',
    nullable: true,
  })
  distribucion?: string;

  @Column({
    name: 'comentarioTaxonomico',
    type: 'text',
    nullable: true,
  })
  comentarioTaxonomico?: string;

  @Column({
    name: 'habitat',
    type: 'text',
    nullable: true,
  })
  habitat?: string;

  @Column({
    name: 'uso',
    type: 'text',
    nullable: true,
  })
  uso?: string;

  @Column({
    name: 'probabilidadExistencia',
    type: 'text',
    nullable: true,
  })
  probabilidadExistencia?: string;

  @Column({
    name: 'html',
    type: 'text',
    nullable: true,
  })
  html?: string;

  @OneToMany(() => ImageEntity, (image) => image.agave)
  images?: ImageEntity[];

  // los agaves generan uno o varios productos
  @ManyToMany(() => ProductEntity, (product) => product.agaves)
  products?: ProductEntity[];

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    nombreCientifico: string,
    nombresConocidos: string[],
    active: boolean,
    distribucion?: string,
    comentarioTaxonomico?: string,
    habitat?: string,
    uso?: string,
    probabilidadExistencia?: string,
    html?: string,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.nombreCientifico = nombreCientifico;
    this.nombresConocidos = nombresConocidos;
    this.active = active;
    this.distribucion = distribucion;
    this.comentarioTaxonomico = comentarioTaxonomico;
    this.habitat = habitat;
    this.uso = uso;
    this.probabilidadExistencia = probabilidadExistencia;
    this.html = html;
  }
}
