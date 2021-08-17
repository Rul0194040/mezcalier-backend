import { Entity, Column, ManyToOne } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { BrandEntity } from '../../brand.entity';

/**
 * Entity para llevar el control de los comentarios en las marcas
 *
 * @param user UserEntity
 * @param brand BrandEntity
 * @param comment string
 */
@Entity('brandComments')
export class BrandCommentsEntity extends CommonEntity {
  /**
   * El usuario que comenta
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
  /**
   * La marca que recibe el comentario
   */
  @ManyToOne(() => BrandEntity, { onDelete: 'CASCADE' })
  brand: BrandEntity;

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
    brand: BrandEntity,
    comment: string,
    authorized: boolean,
  ) {
    super();
    this.user = user;
    this.brand = brand;
    this.comment = comment;
    this.authorized = authorized;
  }
}
