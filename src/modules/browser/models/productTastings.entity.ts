import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { ProductEntity } from '../../product.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';

/**
 * @ignore
 */
@Entity('productTastings')
export class ProductTastingsEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  product: ProductEntity;

  @OneToMany(() => ImageEntity, (image) => image.productTasting)
  images?: ImageEntity[];

  @Column({
    name: 'comment',
    type: 'text',
    nullable: false,
  })
  experience: string;

  constructor(user: UserEntity, product: ProductEntity, experience: string) {
    super();
    this.user = user;
    this.product = product;
    this.experience = experience;
  }
}
