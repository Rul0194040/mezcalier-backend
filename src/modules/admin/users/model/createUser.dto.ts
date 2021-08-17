import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
/**
 * @ignore
 */
export class createUserDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  active?: boolean;

  constructor(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    active?: boolean,
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.active = active;
  }
}
