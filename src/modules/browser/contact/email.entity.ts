import { Entity, Column } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';

/**
 * Entity para llevar el control de los comentarios en las casas mezcaleras
 *
 * @param email email
 * @param message string
 */
@Entity('emails')
export class EmailEntity extends CommonEntity {
  /**
   * name
   */
  @Column({
    name: 'name',
    type: 'text',
    nullable: false,
  })
  name: string;

  /**
   * El email
   */
  @Column({
    name: 'email',
    type: 'text',
    nullable: false,
  })
  email: string;

  /**
   * El subject
   */
  @Column({
    name: 'subject',
    type: 'text',
    nullable: false,
  })
  subject: string;

  /**
   * El mensaje
   */
  @Column({
    name: 'message',
    type: 'text',
    nullable: false,
  })
  message: string;

  constructor(name: string, subject: string, email: string, message: string) {
    super();
    this.name = name;
    this.subject = subject;
    this.email = email;
    this.message = message;
  }
}
