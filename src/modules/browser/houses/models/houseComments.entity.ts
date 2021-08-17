import { Entity, Column, ManyToOne } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { HouseEntity } from '../../../house.entity';

/**
 * Entity para llevar el control de los comentarios en las casas mezcaleras
 *
 * @param user UserEntity
 * @param house HouseEntity
 * @param comment string
 */
@Entity('houseComments')
export class HouseCommentsEntity extends CommonEntity {
  /**
   * El usuario que comenta
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  /**
   * La casa que recibe el comentario
   */
  @ManyToOne(() => HouseEntity, { onDelete: 'CASCADE' })
  house: HouseEntity;

  /**
   * El comentario
   */
  @Column({
    name: 'comment',
    type: 'text',
    nullable: false,
  })
  comment: string;

  @Column({ name: 'authorized', type: 'boolean', default: false })
  authorized?: boolean;

  constructor(
    user: UserEntity,
    house: HouseEntity,
    comment: string,
    authorized: boolean,
  ) {
    super();
    this.user = user;
    this.house = house;
    this.comment = comment;
    this.authorized = authorized;
  }
}
