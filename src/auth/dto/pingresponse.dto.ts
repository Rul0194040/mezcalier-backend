import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
/**
 * @ignore
 */
export class PingResponseDTO {
  @ApiProperty()
  @IsString()
  result: string;
}
