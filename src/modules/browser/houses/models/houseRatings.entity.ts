import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { HouseEntity } from '../../../house.entity';

/**
 * @ignore
 */
@Entity('houseRatings')
@Unique('house_likes', ['user', 'house'])
export class HouseRatingEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => HouseEntity, { onDelete: 'CASCADE' })
  house: HouseEntity;

  @Column({
    name: 'rating',
    type: 'float',
    nullable: false,
  })
  rating: number;

  constructor(user: UserEntity, house: HouseEntity, rating: number) {
    super();
    this.user = user;
    this.house = house;
    this.rating = rating;
  }
}
