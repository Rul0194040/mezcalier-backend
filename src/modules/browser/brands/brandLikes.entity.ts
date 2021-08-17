import { Entity, ManyToOne, Unique } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { BrandEntity } from '../../brand.entity';
/**
 * @ignore
 */
@Entity('brandLikes')
@Unique('brand_likes', ['user', 'brand'])
export class BrandLikesEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
  @ManyToOne(() => BrandEntity, { onDelete: 'CASCADE' })
  brand: BrandEntity;
  constructor(user: UserEntity, brand: BrandEntity) {
    super();
    this.user = user;
    this.brand = brand;
  }
}
