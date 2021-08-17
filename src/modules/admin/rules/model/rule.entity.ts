import { Entity, Column } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
/**
 * @ignore
 */
@Entity('rules')
export class RuleEntity extends CommonEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  description: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  value: string;

  constructor(
    id: number,
    name: string,
    description: string,
    value: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.name = name;
    this.value = value;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
