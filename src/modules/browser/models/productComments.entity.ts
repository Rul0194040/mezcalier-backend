import { Entity, Column, ManyToOne } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { ProductEntity } from '@mezcal/modules/product.entity';

/**
 * @ignore
 */
@Entity('productComments')
export class ProductCommentsEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  product: ProductEntity;

  @Column({
    name: 'comment',
    type: 'text',
    nullable: false,
  })
  comment: string;

  @Column({ name: 'authorized', type: 'boolean' })
  authorized: boolean;

  constructor(
    user: UserEntity,
    product: ProductEntity,
    comment: string,
    authorized: boolean,
  ) {
    super();
    this.user = user;
    this.product = product;
    this.comment = comment;
    this.authorized = authorized;
  }
}
