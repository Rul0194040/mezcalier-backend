import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { ProductEntity } from '../../product.entity';

/**
 * @ignore
 */
@Entity('productRatings')
@Unique('product_likes', ['user', 'product'])
export class ProductRatingEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  product: ProductEntity;

  @Column({
    name: 'rating',
    type: 'float',
    nullable: false,
  })
  rating: number;

  constructor(user: UserEntity, product: ProductEntity, rating: number) {
    super();
    this.user = user;
    this.product = product;
    this.rating = rating;
  }
}
