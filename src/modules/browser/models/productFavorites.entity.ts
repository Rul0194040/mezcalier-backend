import { Entity, ManyToOne, Unique } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { ProductEntity } from '@mezcal/modules/product.entity';
/**
 * @ignore
 */
@Entity('productFavorites')
@Unique('product_favorites', ['user', 'product'])
export class ProductFavoritesEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  product: ProductEntity;
  constructor(user: UserEntity, product: ProductEntity) {
    super();
    this.user = user;
    this.product = product;
  }
}
