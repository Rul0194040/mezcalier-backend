import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { Entity, Column } from 'typeorm';
/**
 * Entidad para definiciones
 */
@Entity('definitions')
export class DefinitionsEntity extends CommonEntity {
  /**
   * @ignore
   */
  @Column({
    type: 'varchar',
    default: 'catalogo',
    length: 50,
    nullable: false,
  })
  type: string;
  /**
   * @ignore
   */

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;
  /**
   * @ignore
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  title: string;
  /**
   * @ignore
   */
  @Column({
    type: 'varchar',
    default: 'Valor',
    length: 50,
    nullable: false,
  })
  label: string;
  /**
   * @ignore
   */
  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  vieworder: number;
  /**
   * @ignore
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'close',
  })
  icon: string;
  /**
   * Constructor
   *
   * @param id
   * @param type
   * @param name
   * @param title
   * @param label
   * @param vieworder
   * @param icon
   */
  constructor(
    id: number,
    type: string,
    name: string,
    title: string,
    label: string,
    vieworder: number,
    icon: string,
  ) {
    super();
    this.id = id;
    this.type = type;
    this.name = name;
    this.title = title;
    this.label = label;
    this.vieworder = vieworder;
    this.icon = icon;
  }
}
