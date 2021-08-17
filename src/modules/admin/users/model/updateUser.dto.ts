import { ApiProperty } from '@nestjs/swagger';
/**
 * DTO para usuarios
 */
export class UpdateUserDTO {
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

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
