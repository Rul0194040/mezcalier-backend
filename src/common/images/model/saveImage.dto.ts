import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class SaveImageDTO {
  @ApiProperty()
  title?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  parent: number;
}
