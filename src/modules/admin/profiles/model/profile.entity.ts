import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
/**
 * @ignore
 */
@Entity('profiles')
export class ProfileEntity extends CommonEntity {
  @Column({
    unique: true,
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((type) => RuleEntity, { cascade: true, eager: true })
  @JoinTable()
  rules?: RuleEntity[];

  @OneToMany(() => UserEntity, (user) => user.profile)
  users?: UserEntity[];

  constructor(id: number, name: string, rules?: RuleEntity[]) {
    super();
    this.id = id;
    this.name = name;
    this.rules = rules;
  }
}
