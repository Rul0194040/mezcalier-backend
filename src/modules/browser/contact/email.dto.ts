import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class EmailDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  email: string;
}
