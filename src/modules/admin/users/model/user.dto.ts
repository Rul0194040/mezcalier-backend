import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
/**
 * DTO para usuarios
 */
export class UserDTO {
  /**
   * Id del usuario
   */
  @ApiProperty()
  readonly id?: number;

  /**
   * uuid, autogenerado
   */
  @ApiProperty()
  uuid?: string;
  /**
   * Email del usuairo
   */
  @ApiProperty()
  @IsEmail()
  email: string;

  /**
   * Primer Nombre del usuario
   */
  @ApiProperty()
  firstName: string;

  /**
   * Apellido del usuario
   */
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  /**
   * Contraseña
   */
  password: string;
  @ApiProperty()

  /**
   * Si esta activo o no
   */
  active?: boolean;

  /**
   * Las reglas a insertar en el usuario
   */
  @ApiProperty()
  rules?: string[];

  /**
   * El perfil que usara este usuario
   */

  @ApiProperty()
  profile: number;

  @ApiProperty()
  house?: number;

  @ApiProperty()
  validEmail?: boolean;

  @ApiProperty()
  emailToken?: string;
  constructor(
    id: number,
    uuid: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    active: boolean,
    rules: string[],
    profile: number,
    house?: number,
    emailToken?: string,
    validEmail?: boolean,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.active = active;
    this.rules = rules;
    this.profile = profile;
    this.emailToken = emailToken;
    this.house = house;
    this.validEmail = validEmail;
  }
}
