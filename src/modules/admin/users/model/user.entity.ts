import { Entity, Column, ManyToOne } from 'typeorm';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { RegTypes } from '@mezcal/common/enum/regTypes.enum';
/**
 * @ignore
 */
@Entity('users')
export class UserEntity extends CommonEntity {
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  passwordToken: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  passwordTokenDate: Date;

  @Column({
    unique: true,
    type: 'varchar',
    name: 'email',
    length: 150,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
    select: false,
  })
  password: string; //.addSelect("user.password") para traer el campo cuando sea necesario

  @Column({
    type: 'boolean',
    default: false,
  })
  validEmail?: boolean;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  emailToken?: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  rules?: string[];

  @ManyToOne(() => ProfileEntity, (profile) => profile.users, { eager: true })
  profile: ProfileEntity; //la columna profile, es un Profiles

  @Column({
    type: 'number',
    nullable: false,
  })
  profileId: number;

  @ManyToOne(() => HouseEntity, (house) => house.users, { eager: true })
  house?: HouseEntity;

  @Column({
    type: 'number',
    nullable: true,
  })
  houseId: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  facebookId?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: RegTypes.SYSTEM,
  })
  regType?: RegTypes;

  @Column({
    name: 'regData',
    type: 'json',
    nullable: true,
    select: false, //no mandar esta columna a menos que se solicite en los selects
  })
  regData?: any;

  @Column({
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  picUrl?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  googleId?: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isMain: boolean;

  constructor(
    id: number,
    uuid: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    active: boolean,
    rules: string[],
    profile: ProfileEntity,
    house: HouseEntity,
    emailToken: string,
    validEmail: boolean,
    regType: RegTypes,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    regData?: any,
    facebookId?: string,
    picUrl?: string,
    googleId?: string,
    isMain?: boolean,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.active = active;
    this.rules = rules;
    this.profile = profile;
    this.house = house;
    this.emailToken = emailToken;
    this.validEmail = validEmail;
    this.regType = regType;
    this.regData = regData;
    this.facebookId = facebookId;
    this.picUrl = picUrl;
    this.googleId = googleId;
    this.isMain = isMain;
  }
}
