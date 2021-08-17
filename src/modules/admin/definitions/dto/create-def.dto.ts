import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class CreateDefDTO {
  @ApiProperty()
  type: string;
  name: string;
  title: string;
  label?: string;
  vieworder?: number;
  icon?: string;
}
