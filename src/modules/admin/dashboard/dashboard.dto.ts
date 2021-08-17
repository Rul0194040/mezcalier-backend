import { ApiProperty } from '@nestjs/swagger';

export class DashboardDTO {
  @ApiProperty()
  casas: number;

  @ApiProperty()
  marcas: number;

  @ApiProperty()
  productos: number;

  @ApiProperty()
  usuarios: number;
}
