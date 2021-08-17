import { Entity, ManyToOne, Unique } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { HouseEntity } from '../../../house.entity';
/**
 * @ignore
 */
@Entity('houseLikes')
@Unique('house_likes', ['user', 'house'])
export class HouseLikesEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
  @ManyToOne(() => HouseEntity, { onDelete: 'CASCADE' })
  house: HouseEntity;
  constructor(user: UserEntity, house: HouseEntity) {
    super();
    this.user = user;
    this.house = house;
  }
}
