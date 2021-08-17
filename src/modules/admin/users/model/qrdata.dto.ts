import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class QrDataDTO {
  @ApiProperty()
  otpauthUrl: string;
  @ApiProperty()
  base32: string;
  @ApiProperty()
  qrCode: string;
}
