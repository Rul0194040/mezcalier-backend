import {
  Column,
  CreateDateColumn,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
/**
 * Todas nuestros entities tienen estos campos, mejor se ponen aqui
 */
export abstract class CommonEntity {
  /**
   * @ignore
   */
  @PrimaryGeneratedColumn()
  id?: number;
  /**
   * @ignore
   */
  @Column({
    name: 'uuid',
    unique: true,
  })
  @Generated('uuid')
  uuid?: string;
  /**
   * @ignore
   */
  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt?: Date;
  /**
   * @ignore
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt?: Date;
  /**
   * @ignore
   */
  @Column({
    name: 'active',
    type: 'boolean',
    default: true,
  })
  active?: boolean;
}
