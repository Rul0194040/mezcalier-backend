import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { BrandEntity } from '../../brand.entity';

/**
 * @ignore
 */
@Entity('brandRatings')
@Unique('brand_likes', ['user', 'brand'])
export class BrandRatingEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => BrandEntity, { onDelete: 'CASCADE' })
  brand: BrandEntity;

  @Column({
    name: 'rating',
    type: 'float',
    nullable: false,
  })
  rating: number;

  constructor(user: UserEntity, brand: BrandEntity, rating: number) {
    super();
    this.user = user;
    this.brand = brand;
    this.rating = rating;
  }
}
