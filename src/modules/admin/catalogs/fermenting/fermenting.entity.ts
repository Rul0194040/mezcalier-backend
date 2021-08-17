import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

@Entity('fermenting')
export class FermentingEntity extends CommonEntity {
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
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  descripcion: string;

  @ManyToMany(() => ProcesseEntity, (processe) => processe.fermentings)
  processes?: ProcesseEntity[];

  @OneToMany(() => ProductEntity, (product) => product.fermenting)
  products?: ProductEntity[];
}
